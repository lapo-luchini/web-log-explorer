export interface Checkpoint {
  origin: string;
  entries: number;
  root_hash: string;
  signature: string;
  text: string;
}

export function buf2hex(buf: Uint8Array) {
  // buffer is an ArrayBuffer
  return [...buf]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

const HEIGHT = 8;
const PATH_BASE = 1000;

export async function getCheckpoint(logUrl: string): Promise<Checkpoint> {
  const resp = await fetch(logUrl + "checkpoint");
  const text = await resp.text();
  const lines = text.split("\n");

  return {
    origin: lines[0],
    entries: parseInt(lines[1], 10),
    root_hash: lines[2],
    signature: lines[3].slice(2), // Removes the leading "— "
    text,
  };
}

export async function getIndex(
  logUrl: string,
  index: number
): Promise<LogEntry> {
  const total = (await getCheckpoint(logUrl)).entries;
  let tile = await getLeaf(logUrl, leafForIndex(index), total);

  let reader = new ByteReader(tile);

  // call ReadTileLeaf in a loop until the index of the log entry is found
  while (reader.length() > 0) {
    const entry = await ReadTileLeaf(reader);
    if (entry.LeafIndex === index) {
      return entry;
    }
  }

  throw new Error("entry not found");
}

// ---------------------------------------------------------

function leafForIndex(index: number): number {
  return Math.floor(index / (1 << HEIGHT));
}

function pathForLeaf(i: number, total: number): string {
  let n = i;
  let nStr = String(n % PATH_BASE).padStart(3, "0");

  while (n >= PATH_BASE) {
    n = Math.floor(n / PATH_BASE);
    nStr = `x${String(n % PATH_BASE).padStart(3, "0")}/${nStr}`;
  }

  let pStr = "";
  if (leafForIndex(total) === i) {
    const finalWidth = total % (1 << HEIGHT);
    pStr = `.p/${finalWidth}`;
  }

  return `tile/data/${nStr}${pStr}`;
}

async function getLeaf(
  logUrl: string,
  index: number,
  total: number
): Promise<Uint8Array> {
  const resp = await fetch(logUrl + pathForLeaf(index, total));
  return new Uint8Array(await resp.arrayBuffer());
}

// ---------------------------------------------------------

export class LogEntry {
  Timestamp: number = 0;
  IsPrecert: boolean = false;
  Certificate: Uint8Array = new Uint8Array();
  PreCertificate: Uint8Array = new Uint8Array();
  IssuerKeyHash: Uint8Array = new Uint8Array(32);
  ChainFp: Uint8Array[] = [];
  CertificateFp: Uint8Array = new Uint8Array(32);
  LeafIndex: number = 0;
}

class ByteReader {
  private view;
  private offset;

  constructor(buffer: Uint8Array) {
    this.view = new DataView(buffer.buffer);
    this.offset = 0;
  }

  readUint64(): number {
    const value = this.view.getBigUint64(this.offset, false);
    this.offset += 8;
    return Number(value);
  }

  readUint16(): number {
    const value = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return value;
  }

  readUint8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readUint40(): number {
    const value =
      this.view.getUint8(this.offset) * 2 ** 32 +
      this.view.getUint32(this.offset + 1, false);
    this.offset += 5;
    return value;
  }

  readUint24LengthPrefixed(): Uint8Array {
    const length =
      (this.view.getUint8(this.offset) << 16) |
      (this.view.getUint8(this.offset + 1) << 8) |
      this.view.getUint8(this.offset + 2);
    const value = new Uint8Array(this.view.buffer, this.offset + 3, length);
    this.offset += 3 + length;
    return value;
  }

  readUint16LengthPrefixed(): Uint8Array {
    const length = this.view.getUint16(this.offset, false);
    const value = new Uint8Array(this.view.buffer, this.offset + 2, length);
    this.offset += 2 + length;
    return value;
  }

  read(x: number): Uint8Array {
    const value = new Uint8Array(this.view.buffer, this.offset, x);
    this.offset += x;
    return value;
  }

  length(): number {
    return this.view.byteLength - this.offset;
  }
}

async function ReadTileLeaf(tile: ByteReader): Promise<LogEntry> {
  const e = new LogEntry();
  const reader = tile;

  let timestamp = reader.readUint64();
  let entryType = reader.readUint16();

  if (timestamp > Number.MAX_SAFE_INTEGER) {
    throw new Error("invalid data tile");
  }
  e.Timestamp = Number(timestamp);

  let extensions: Uint8Array;
  switch (entryType) {
    case 0: // x509_entry
      e.Certificate = reader.readUint24LengthPrefixed();
      extensions = reader.readUint16LengthPrefixed();
      break;
    case 1: // precert_entry
      e.IsPrecert = true;
      e.IssuerKeyHash.set(reader.read(32));
      e.Certificate = reader.readUint24LengthPrefixed();
      extensions = reader.readUint16LengthPrefixed();
      e.PreCertificate = reader.readUint24LengthPrefixed();
      break;
    default:
      throw new Error(`invalid data tile: unknown type ${entryType}`);
  }

  let fingerprintBytes = reader.readUint16();
  const fingerprintCount = fingerprintBytes / 32;
  e.ChainFp = [];
  for (let i = 0; i < fingerprintCount; i++) {
    const fingerprint = new Uint8Array(reader.read(32));
    e.ChainFp.push(fingerprint);
  }

  if (e.IsPrecert) {
    e.CertificateFp = new Uint8Array(
      await crypto.subtle.digest("SHA-256", e.PreCertificate)
    );
  } else {
    e.CertificateFp = new Uint8Array(
      await crypto.subtle.digest("SHA-256", e.Certificate)
    );
  }

  let leafIndex =
    (extensions[3] << 32) |
    (extensions[4] << 24) |
    (extensions[5] << 16) |
    (extensions[6] << 8) |
    extensions[7];

  e.LeafIndex = leafIndex;

  return e;
}
