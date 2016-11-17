import _ from 'lodash';
import assert from 'assert';
import stream from 'stream';
import util, {format} from 'util';

let safeJsonStringify = null;
try {
  safeJsonStringify = require('safe-json-stringify');
} catch (e) {
  // do nothing
}

export class StreamWrapper extends stream.Writable {
  constructor(stream, modifierCallback) {
    super();

    this.stream = stream;
    this.modifierCallback = modifierCallback;
  }

  write(record) {
    return this.stream.write(this.modifierCallback(record));
  }
}

export class ExcludingStreamWrapper extends StreamWrapper {
  constructor(stream, excludes) {
    super(stream, (record) => this._excludeFields(record));

    this.excludes = excludes;
  }

  _excludeFields(record) {
    return _.omit(record, this.excludes);
  }
}

export class StringifyStreamWrapper extends StreamWrapper {
  constructor(stream) {
    super(stream, (record) => this._stringify(record));
  }

  _stringify(record) {
    try {
      return JSON.stringify(record, safeCycles()) + '\n';
    } catch (e) {
      if (safeJsonStringify) {
        return safeJsonStringify(record) + '\n';
      } else {
        const dedupKey = e.stack.split(/\n/g, 2).join('\n');
        _warn('bunyan: ERROR: Exception in '
            + '`JSON.stringify(record)`. You can install the '
            + '"safe-json-stringify" module to have Bunyan fallback '
            + 'to safer stringification. Record:\n'
            + _indent(format('%s\n%s', util.inspect(record), e.stack)),
            dedupKey);
        return format('(Exception in JSON.stringify(record): %j. '
            + 'See stderr for details.)\n', e.message);
      }
    }
  }
}

class StreamWrapperBuilder {
  constructor(finalStream) {
    this.streams = [];
    this.finalStream = finalStream;
  }
  rewrite(modifierCallback) {
    this.streams.push(new StreamWrapper(null, modifierCallback));
    return this;
  }
  exclude(excludes) {
    this.streams.push(new ExcludingStreamWrapper(null, excludes));
    return this;
  }
  stringify() {
    this.streams.push(new StringifyStreamWrapper(null));
    return this;
  }
  build() {
    this.streams.push(this.finalStream);
    for (let i = 0; i < this.streams.length - 1; ++i) {
      this.streams[i].stream = this.streams[i + 1];
    }
    return this.streams[0];
  }
}

export function builder(stream) {
  return new StreamWrapperBuilder(stream);
}

export default {
  builder,
  StreamWrapper,
  ExcludingStreamWrapper,
};



/* *** From bunyan.js: *** */

// A JSON stringifier that handles cycles safely.
// Usage: JSON.stringify(obj, safeCycles())
function safeCycles() {
  const seen = [];
  return function (key, val) {
    if (!val || typeof (val) !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  };
}

/**
 * Warn about an bunyan processing error.
 *
 * @param msg {String} Message with which to warn.
 * @param dedupKey {String} Optional. A short string key for this warning to
 *      have its warning only printed once.
 */
const _warned = {};
function _warn(msg, dedupKey) {
  assert.ok(msg);
  if (dedupKey) {
    if (_warned[dedupKey]) {
      return;
    }
    _warned[dedupKey] = true;
  }
  process.stderr.write(msg + '\n');
}

function _indent(s, indent = '    ') {
  return indent + s.split(/\r?\n/g).join('\n' + indent);
}
/* *** End bunyan.js: *** */

