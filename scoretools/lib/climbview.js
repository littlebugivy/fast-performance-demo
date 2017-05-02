// Generated by CoffeeScript 1.11.1
(function() {
  var Generator;

  Generator = (function() {
    function Generator(title1, config) {
      var ref, ref1, ref2, ref3, ref4, ref5, ref6;
      this.title = title1;
      this.preload = [];
      this.layers = [
        {
          title: 'background',
          channel: 'v.background',
          loop: true,
          fadeIn: (ref = config.backgroundfadein) != null ? ref : 0,
          fadeOut: (ref1 = config.backgroundfadeout) != null ? ref1 : 0,
          crossfade: false
        }, {
          title: 'animation',
          channel: 'v.animation',
          defaultUrl: config.noanimationurl,
          loop: false,
          fadeIn: 0,
          fadeOut: 0,
          crossfade: true
        }, {
          title: 'weather',
          channel: 'v.weather',
          loop: true,
          fadeIn: (ref2 = config.weatherfadein) != null ? ref2 : 0,
          fadeOut: (ref3 = config.weatherfadeout) != null ? ref3 : 0,
          crossfade: true
        }, {
          title: 'muzicode',
          channel: 'v.muzicode',
          loop: false,
          fadeIn: (ref4 = config.muzicodefadein) != null ? ref4 : 0,
          fadeOut: (ref5 = config.muzicodefadeout) != null ? ref5 : 0,
          holdTime: (ref6 = config.muzicodeholdtime) != null ? ref6 : null,
          crossfade: true
        }
      ];
      this.add(config.noanimationurl);
      this.add(config.no_url);
      this.add(config.defaultmuzicodeurl);
      this.add(config.rain_url);
      this.add(config.snow_url);
      this.add(config.sun_url);
      this.add(config.storm_url);
      this.add(config.wind_url);
    }

    Generator.prototype.get = function() {
      return {
        title: this.title,
        generated: (new Date()).toISOString(),
        preload: this.preload,
        layers: this.layers
      };
    };

    Generator.prototype.add = function(url) {
      if ((url != null) && (this.preload.indexOf(url)) < 0) {
        return this.preload.push(url);
      }
    };

    return Generator;

  })();

  module.exports.generator = function(title, config) {
    return new Generator(title, config);
  };

  module.exports.BACKGROUND = 'v.background';

  module.exports.ANIMATION = 'v.animation';

  module.exports.WEATHER = 'v.weather';

  module.exports.MUZICODE = 'v.muzicode';

}).call(this);