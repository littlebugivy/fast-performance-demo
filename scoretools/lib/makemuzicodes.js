// Generated by CoffeeScript 1.11.1
(function() {
  var add_actions, cell, cellid, config, configdir, configfile, content_url, control, cuesingle, data, defaultprojection, e, effects, errors, ex, exinfile, exoutfile, fragment, fragments, fs, getCodeIds, get_marker, i, id, ids, j, k, l, label, labels, len, len1, len2, len3, len4, len5, len6, len7, m, marker, mc, mcs, meiids, name, o, p, path, prefix, prefixes, q, r, readmeiids, readrow, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, relpath, s, set_stage, sheet, stage, stages, suffix, t, u, w, weathers, wi, workbook, xlfile, xlsx, yaml;

  if (process.argv.length !== 2 && process.argv.length !== 3) {
    console.log('Usage: node makemuzicodes [<config.yaml>]');
    process.exit(-1);
  }

  yaml = require('js-yaml');

  fs = require('fs');

  path = require('path');

  getCodeIds = (require('./meiutils')).getCodeIds;

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
    marker.precondition = '';
  }

  ex.parameters.initstate = {
    stage: '""',
    cued: false,
    meldmei: '""',
    meldcollection: '""',
    meldannostate: '""',
    meldnextmeifile: 'null',
    mcserver: JSON.stringify((ref2 = config.mcserver) != null ? ref2 : 'http://localhost:3000/input'),
    meldmeiuri: JSON.stringify((ref3 = config.meldmeiuri) != null ? ref3 : 'http://localhost:3000/content/'),
    contenturi: JSON.stringify((ref4 = config.contenturi) != null ? ref4 : 'http://localhost:3000/content/')
  };

  defaultprojection = String((ref5 = config.defaultprojection) != null ? ref5 : '');

  if (defaultprojection === '') {
    console.log("WARNING: defaultprojection is not defined in " + configfile);
  } else {
    if (((ref6 = (function() {
      var j, len1, ref7, ref8, results;
      ref8 = (ref7 = ex.projections) != null ? ref7 : [];
      results = [];
      for (j = 0, len1 = ref8.length; j < len1; j++) {
        p = ref8[j];
        if (p.id === defaultprojection) {
          results.push(p);
        }
      }
      return results;
    })()) != null ? ref6 : []).length === 0) {
      console.log('WARNING: cannot find default projection "' + defaultprojection + '"');
    } else {
      console.log('using default projection "' + defaultprojection + '"');
    }
  }

  cuesingle = (ref7 = config.cuesingle) != null ? ref7 : false;

  stages = {};

  prefixes = ['auto_', 'mc1_', 'mc2_', 'mc3_', 'mc4_', 'mc5_', 'default_'];

  mcs = ['mc1_', 'mc2_', 'mc3_'];

  weathers = ['no', 'wind', 'rain', 'snow', 'sun', 'storm'];

  effects = '[';

  for (wi = j = 0, len1 = weathers.length; j < len1; wi = ++j) {
    w = weathers[wi];
    if (config[w + '_effect'] == null) {
      console.log('ERROR: ' + w + '_effect not defined in ' + configfile);
    }
    if (wi > 0) {
      effects += ',';
    }
    effects += JSON.stringify(config[w + '_effect']);
  }

  effects += ']';

  ex.parameters.initstate.effects = effects;

  content_url = function(url) {
    if ((url.indexOf(':')) < 0 && (url.substring(0, 1)) !== '/') {
      return '{{contenturi}}' + url;
    } else {
      return url;
    }
  };

  add_actions = function(control, prefix, data, meldload) {
    var k, len2, meldprefix, msg, msgs, nextstage, ref8;
    control.actions.push({
      channel: '',
      url: content_url(data[prefix + 'monitor'])
    });
    if (data[prefix + 'visual'] != null) {
      control.actions.push({
        channel: 'visual',
        url: content_url(data[prefix + 'visual'])
      });
    }
    if (data[prefix + 'midi'] != null) {
      msgs = data[prefix + 'midi'].split(',');
      for (k = 0, len2 = msgs.length; k < len2; k++) {
        msg = msgs[k];
        msg = msg.trim();
        if (msg.length > 0) {
          control.actions.push({
            channel: '',
            url: 'data:text/x-midi-hex,' + msg
          });
        }
      }
    }
    if (control.poststate == null) {
      control.poststate = {};
    }
    if (control.precondition == null) {
      control.precondition = '';
    }
    if (data[prefix + 'cue'] != null) {
      nextstage = data[prefix + 'cue'];
      if ((cuesingle && prefix !== 'auto_' && control.precondition.indexOf('cued')) < 0) {
        control.precondition = '!cued' + (control.precondition.length === 0 ? '' : ' && (') + control.precondition + (control.precondition.length === 0 ? '' : ')');
      }
      if ((ref8 = !stages[nextstage]) != null ? ref8 : console.log('ERROR: stage ' + data.stage + ' ' + prefix + ' cue to unknown stage: ' + nextstage)) {

      } else {
        meldprefix = meldload ? 'params.' : '';
        control.actions.push({
          url: '{{' + meldprefix + 'meldcollection}}',
          post: true,
          contentType: 'application/json',
          body: '{"oa:hasTarget":["{{' + meldprefix + 'meldannostate}}"], "oa:hasBody":[{"@type":"meldterm:CreateNextCollection", "resourcesToQueue":["{{meldmeiuri}}' + encodeURIComponent(stages[nextstage].meifile) + '"], "annotationsToQueue":[]}] }'
        });
        control.poststate.meldnextmeifile = JSON.stringify(stages[nextstage].meifile);
        return control.poststate.cued = "true";
      }
    }
  };

  set_stage = function(control, data) {
    var k, l, len2, n, ni, ref8, ws;
    if (control.poststate == null) {
      control.poststate = {};
    }
    control.poststate.cued = "false";
    control.poststate.stage = JSON.stringify(data.stage);
    ws = [];
    for (wi = k = 0, len2 = weathers.length; k < len2; wi = ++k) {
      w = weathers[wi];
      if ((data[w + '_effect'] != null) && data[w + '_effect'].length > 0) {
        if (data[w + '_effect'].substring(0, 1).toLowerCase() === 'y') {
          ws.push(wi);
        } else if (data[w + '_effect'].substring(0, 1).toLowerCase() !== 'n') {
          n = parseInt(data[w + '_effect']);
          if (isNaN(n)) {
            console.log('WARNING: error in weather ' + w + ' value ' + data[w + '_effect'] + ' (should be Y, N or count)');
          }
          if (!(isNaN(n)) && n > 0) {
            for (ni = l = 1, ref8 = n; 1 <= ref8 ? l <= ref8 : l >= ref8; ni = 1 <= ref8 ? ++l : --l) {
              ws.push(wi);
            }
          }
        }
      }
    }
    if (ws.length > 0) {
      return control.actions.push({
        url: '{{effects[([' + (ws.join(',')) + '])[Math.floor(Math.random()*' + ws.length + ')]]}}'
      });
    }
  };

  get_marker = function(ex, markertitle, optdescription) {
    var markers, ref8;
    markers = (ref8 = (function() {
      var k, len2, ref9, results;
      ref9 = ex.markers;
      results = [];
      for (k = 0, len2 = ref9.length; k < len2; k++) {
        marker = ref9[k];
        if (marker.title === markertitle) {
          results.push(marker);
        }
      }
      return results;
    })()) != null ? ref8 : [];
    if (markers.length > 1) {
      console.log('WARNING: marker "' + markertitle + '" defined ' + markers.length + ' times; using first');
    } else if (markers.length === 0) {
      console.log('WARNING: marker  "' + markertitle + '" undefined - adding to output');
      marker = {
        title: markertitle,
        description: optdescription,
        poststate: {},
        actions: [],
        precondition: ''
      };
      ex.markers.push(marker);
      markers = [marker];
    }
    return markers[0];
  };

  for (r = k = 1; k <= 1000; r = ++k) {
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
    for (l = 0, len2 = prefixes.length; l < len2; l++) {
      prefix = prefixes[l];
      if (data[name = prefix + 'monitor'] == null) {
        data[name] = 'data:text/plain,stage ' + data.stage + ' ' + prefix + ' triggered!';
      }
    }
    if (data.meifile == null) {
      console.log('WARNING: no meifile specified for stage ' + data.stage);
      data.meifile = data.stage + '.mei';
    }
  }

  readmeiids = function(meifile) {
    var mei, meidir;
    meidir = configdir;
    if (config.meidir) {
      meidir = relpath(config.meidir, configdir);
    }
    meifile = relpath(meifile, meidir);
    mei = null;
    console.log('Processing mei file ' + meifile);
    try {
      mei = fs.readFileSync(meifile, 'utf8');
      if (mei.length > 0 && mei.charCodeAt(0) !== 60 && mei.charCodeAt(0) !== 65279) {
        mei = fs.readFileSync(meifile, 'ucs2');
        if (mei.length > 0 && mei.charCodeAt(0) !== 60 && mei.charCodeAt(0) !== 65279) {
          console.log('ERROR: file does not seem to be utf16 or utf8 XML: ' + meifile);
          return {};
        }
      }
    } catch (error) {
      e = error;
      console.log('ERROR: reading mei file ' + meifile + ': ' + e.message);
      return {};
    }
    return getCodeIds(mei);
  };

  for (r = m = 1; m <= 1000; r = ++m) {
    cell = sheet[cellid(0, r)];
    if (cell === void 0) {
      break;
    }
    if (cell.v == null) {
      continue;
    }
    data = stages[cell.v];
    meiids = readmeiids(data.meifile);
    if (r === 1) {
      ex.parameters.initstate.stage = JSON.stringify(data.stage);
      control = {
        inputUrl: 'event:load',
        actions: []
      };
      ex.controls.push(control);
      set_stage(control, data);
      add_actions(control, 'auto_', data);
    } else {
      control = {
        inputUrl: 'button:' + data.stage,
        actions: []
      };
      ex.controls.push(control);
      set_stage(control, data);
      add_actions(control, 'auto_', data);
    }
    control = {
      inputUrl: 'post:meld.load',
      actions: []
    };
    control.precondition = 'params.meldmei==(meldmeiuri+' + (JSON.stringify(encodeURIComponent(data.meifile))) + ')';
    ex.controls.push(control);
    set_stage(control, data);
    add_actions(control, 'auto_', data, true);
    control.poststate.meldmei = 'params.meldmei';
    control.poststate.meldannostate = 'params.meldannostate';
    control.poststate.meldcollection = 'params.meldcollection';
    control.poststate.meldnextmeifile = 'null';
    for (o = 0, len3 = mcs.length; o < len3; o++) {
      mc = mcs[o];
      if (!data[mc + 'name']) {
        continue;
      }
      marker = get_marker(ex, data[mc + 'name'], 'stage ' + data.stage + ' ' + mc + 'name');
      suffix = '';
      if (marker.precondition.length > 0) {
        if (marker.precondition.substring(marker.precondition.length - 1) === ')') {
          suffix = ')';
          marker.precondition = marker.precondition.substring(0, marker.precondition.length - 1);
        }
        marker.precondition += ' || ';
      }
      marker.precondition += 'stage=="' + data.stage + '"' + suffix;
      add_actions(marker, mc, data);
      if ((data[mc] != null) && data[mc] !== '') {
        labels = String(data[mc]).split(',');
        fragments = [];
        for (q = 0, len4 = labels.length; q < len4; q++) {
          label = labels[q];
          if (label !== '') {
            if ((label.indexOf('#')) === 0) {
              fragments.push(label);
            } else {
              ids = meiids[label];
              if (ids == null) {
                console.log('Warning: could not find code "' + data[mc] + '" in meifile ' + data.meifile + ' (stage ' + data.stage + ' mc ' + mc + ')');
              } else {
                console.log('Code ' + data[mc] + ' -> ' + ids);
                for (s = 0, len5 = ids.length; s < len5; s++) {
                  id = ids[s];
                  fragments.push('#' + id);
                }
              }
            }
          }
        }
        for (t = 0, len6 = fragments.length; t < len6; t++) {
          fragment = fragments[t];
          marker.actions.push({
            url: '{{meldcollection}}',
            post: true,
            contentType: 'application/json',
            body: '{"oa:hasTarget":[{"@id":"{{meldmei}}' + fragment + '"}], "oa:hasBody":[{"@type":"meldterm:Emphasis"}] }'
          });
        }
      }
    }
    if (defaultprojection !== '' && (data['default_cue'] != null)) {
      control = {
        inputUrl: 'event:end:' + defaultprojection,
        actions: [],
        precondition: 'stage==' + (JSON.stringify(data.stage)) + ' && !cued',
        poststate: {}
      };
      ex.controls.push(control);
      add_actions(control, 'default_', data);
    }
  }

  errors = 0;

  for (stage in stages) {
    data = stages[stage];
    for (u = 0, len7 = prefixes.length; u < len7; u++) {
      prefix = prefixes[u];
      if ((data[prefix + 'cue'] != null) && (stages[data[prefix + 'cue']] == null)) {
        console.log('ERROR: stage ' + stage + ' ' + prefix + 'cue refers to unknown stage "' + data[prefix + 'cue'] + '"');
        errors++;
      }
    }
  }

  control = {
    inputUrl: 'button:Force Next',
    actions: [],
    precondition: '!!meldnextmeifile'
  };

  ex.controls.push(control);

  control.actions.push({
    url: 'http://localhost:3000/input',
    post: true,
    contentType: 'application/x-www-form-urlencoded',
    body: 'name=meld.load&meldmei={{meldmeiuri}}{{encodeURIComponent(meldnextmeifile)}}&meldcollection=&meldannostate='
  });

  control = {
    inputUrl: 'button:pedal',
    actions: []
  };

  ex.controls.push(control);

  control.actions.push({
    url: 'http://localhost:3000/input',
    post: true,
    contentType: 'application/x-www-form-urlencoded',
    body: 'name=pedal'
  });

  control = {
    inputUrl: 'post:pedal',
    actions: []
  };

  ex.controls.push(control);

  control.actions.push({
    url: '{{meldcollection}}',
    post: true,
    contentType: 'application/json',
    body: '{"oa:hasTarget":["{{meldannostate}}"], "oa:hasBody":[{"@type":"meldterm:NextPageOrPiece"}] }'
  });

  console.log('write experience ' + exoutfile);

  fs.writeFileSync(exoutfile, JSON.stringify(ex, null, '  '), {
    encoding: 'utf8'
  });

  console.log('done');

  return errors;

}).call(this);
