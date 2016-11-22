// Generated by CoffeeScript 1.11.1
(function() {
  var add_actions, cell, cellid, config, configdir, configfile, control, data, e, ex, exinfile, exoutfile, fs, i, j, k, len, len1, marker, mcs, name, path, prefix, prefixes, r, readrow, ref, ref1, relpath, sheet, stages, workbook, xlfile, xlsx, yaml;

  if (process.argv.length !== 2 && process.argv.length !== 3) {
    console.log('Usage: node makemuzicodes [<config.yaml>]');
    process.exit(-1);
  }

  yaml = require('js-yaml');

  fs = require('fs');

  path = require('path');

  configfile = (ref = process.argv[2]) != null ? ref : 'config.yml';

  configfile = path.normalize(configfile);

  configdir = path.isAbsolute(configfile) ? path.dirname(configfile) : path.join(process.cwd(), path.dirname(configfile));

  console.log('read config ' + configfile + ' from ' + configdir);

  config = {};

  try {
    config = yaml.safeLoad(fs.readFileSync(configfile, 'utf8'));
    console.log(config);
  } catch (error) {
    e = error;
    console.log('error reading config ' + configfile + ': ' + e.message);
    process.exit(-2);
  }

  relpath = function(p, base) {
    if (path.isAbsolute(p)) {
      return p;
    } else {
      return path.normalize(path.join(base, p));
    }
  };

  xlfile = relpath(config.spreadsheet, configdir);

  exinfile = relpath(config.experiencein, configdir);

  exoutfile = relpath(config.experienceout, configdir);

  xlsx = require('xlsx');

  fs = require('fs');

  console.log('read template experience ' + exinfile);

  ex = JSON.parse(fs.readFileSync(exinfile, {
    encoding: 'utf8'
  }));

  console.log('read spreadsheet ' + xlfile);

  workbook = xlsx.readFile(xlfile);

  sheet = workbook.Sheets[workbook.SheetNames[0]];

  cellid = function(c, r) {
    var p, rec;
    p = String(r + 1);
    rec = function(c) {
      p = (String.fromCharCode('A'.charCodeAt(0) + (c % 26))) + p;
      c = Math.floor(c / 26);
      if (c !== 0) {
        return rec(c - 1);
      }
    };
    rec(c);
    return p;
  };

  readrow = function(r) {
    var c, data, head, i, key, prefix, ref1, ref2, ref3, ref4, val;
    data = {};
    prefix = '';
    for (c = i = 0; i <= 1000; c = ++i) {
      head = (ref1 = sheet[cellid(c, 0)]) != null ? (ref2 = ref1.v) != null ? ref2.toLowerCase() : void 0 : void 0;
      if (head == null) {
        break;
      }
      if ((head.indexOf(':')) >= 0) {
        prefix = (head.substring(0, head.indexOf(':'))) + '_';
        head = head.substring((head.indexOf(':')) + 1);
      }
      key = prefix + head;
      val = (ref3 = sheet[cellid(c, r)]) != null ? ref3.v : void 0;
      if (val != null) {
        data[key] = (ref4 = sheet[cellid(c, r)]) != null ? ref4.v : void 0;
      }
    }
    return data;
  };

  if (ex.markers == null) {
    ex.markers = [];
  }

  ex.controls = [];

  if (ex.parameters == null) {
    ex.parameters = {};
  }

  ref1 = ex.markers;
  for (i = 0, len = ref1.length; i < len; i++) {
    marker = ref1[i];
    marker.actions = [];
    delete marker.action;
    delete marker.precondition;
    marker.poststate = {};
  }

  ex.parameters.initstate = {
    stage: '""',
    cued: false,
    meldmei: '""',
    meldcollection: '""',
    cuedstage: '""'
  };

  stages = {};

  prefixes = ['auto_', 'mc1_', 'mc2_', 'mc3_'];

  mcs = ['mc1_', 'mc2_', 'mc3_'];

  add_actions = function(actions, prefix, data) {
    control.actions.push({
      channel: '',
      url: data[prefix + 'monitor']
    });
    if (data[prefix + 'visual'] != null) {
      control.actions.push({
        channel: 'visual',
        url: data[prefix + 'visual']
      });
    }
    if (control.poststate == null) {
      control.poststate = {};
    }
    control.poststate.cued = "false";
    return control.poststate.stage = JSON.stringify(data.stage);
  };

  for (r = j = 1; j <= 1000; r = ++j) {
    cell = sheet[cellid(0, r)];
    if (cell === void 0) {
      break;
    }
    data = readrow(r);
    if (data.stage == null) {
      console.log('ignore row without stage name: ' + (JSON.stringify(data)));
      continue;
    }
    console.log('stage ' + data.stage);
    stages[data.stage] = data;
    for (k = 0, len1 = prefixes.length; k < len1; k++) {
      prefix = prefixes[k];
      if (data[name = prefix + 'monitor'] == null) {
        data[name] = 'data:text/plain,stage ' + data.stage + ' ' + prefix + 'monitor';
      }
    }
    if (r === 1) {
      ex.parameters.initstate.stage = JSON.stringify(data.stage);
      control = {
        inputUrl: 'event:load',
        actions: []
      };
      ex.controls.push(control);
      add_actions(control.actions, 'auto_', data);
      control = {
        inputUrl: 'post:meld.load',
        actions: []
      };
      ex.controls.push(control);
      add_actions(control.actions, 'auto_', data);
      control.poststate.meldmei = '"{{params.meldmei}}"';
      control.poststate.meldcollection = '"{{params.meldcollection}}"';
    } else {
      control = {
        inputUrl: 'button:' + data.stage,
        actions: []
      };
      ex.controls.push(control);
      add_actions(control.actions, 'auto_', data);
      control = {
        inputUrl: 'post:meld.load:' + data.stage,
        actions: []
      };
      ex.controls.push(control);
      add_actions(control.actions, 'auto_', data);
      control.poststate.meldmei = '"{{params.meldmei}}"';
      control.poststate.meldcollection = '"{{params.meldcollection}}"';
    }
  }

  console.log('write experience ' + exoutfile);

  fs.writeFileSync(exoutfile, JSON.stringify(ex), {
    encoding: 'utf8'
  });

  console.log('done');

  return 0;

}).call(this);