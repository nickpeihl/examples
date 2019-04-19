const fs = require('fs');
const readline = require('readline');
const repairGeometry = require('./repair-geometry');
const { Writable } = require('stream');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });

class ElasticsearchWritableStream extends Writable {
  constructor(config) {
    super(config);
    this.config = config;

    this.client =
      this.config.client ||
      new Client({
        node: this.config.node,
        index: this.config.index,
      });
  }

  async _write(chunk, enc, cb) {
    try {
      await this.client.index({
        index: index,
        body: { geometry: chunk },
      });
      cb();
    } catch (err) {
      cb(err);
    }
  }

  async _writev(chunks, cb) {
    const body = chunks
      .map(chunk => chunk.chunk)
      .reduce((arr, obj) => {
        /**
         * Each entry to the bulk API comprises an instruction (like 'index'
         * or 'delete') and some data:
         */

        arr.push({ index: {} });
        arr.push({ geometry: obj });
        return arr;
      }, []);

    try {
      await this.client.bulk({
        index: index,
        body,
      });
      cb();
    } catch (err) {
      cb(err);
    }
  }

  async _destroy() {
    return await client.close();
  }
}

const index = 'ms-buildings';
const mapping = {
  dynamic: false,
  properties: {
    geometry: { type: 'geo_shape' },
  },
};

async function run() {
  const res = await client.indices.exists({
    index: 'ms-buildings',
  });
  if (res.statusCode === 404) {
    await client.indices.create({
      index,
      body: {
        mappings: mapping,
      },
    });
  }
  const rl = readline.createInterface({
    input: fs.createReadStream(process.argv[2], { encoding: 'utf8' }),
    output: new ElasticsearchWritableStream({
      client,
      highWaterMark: 500,
      objectMode: true,
    }),
    crlfDelay: Infinity,
  });

  rl.on('line', input => {
    const line = repairGeometry(input, {
      properties: {},
    });
    rl.output.write(JSON.parse(line));
  });
}

run().catch(err => {
  console.log(err);
});
