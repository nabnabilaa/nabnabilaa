/*!
 * batik.js — Library motif batik Indonesia dari kode (tanpa dependensi)
 * Motif: kawung, parang, ceplok, truntum, mega-mendung
 *
 * Cara pakai (HTML biasa):
 *   <div data-batik="kawung" data-fg="#7A3B12" data-bg="#F3E7CB"></div>
 *   lalu muat file ini lewat tag script biasa di HTML.
 *
 * Cara pakai (JS):
 *   Batik.apply('#hero', { motif:'parang', fg:'#5C2C0D', bg:'#F0E2C4', scale:1.2 });
 *   el.style.backgroundImage = Batik.dataUri({ motif:'ceplok' });
 *
 * Opsi: motif, fg (warna motif), bg (warna dasar), scale, opacity, texture (goresan canting)
 * Lisensi: bebas dipakai. Motif adalah warisan budaya tradisional (public domain).
 */
(function (global) {
  'use strict';

  // ---- util warna: campur hex menuju putih (0..1) untuk gradasi ----
  function lighten(hex, amt) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    var r = parseInt(c.slice(0,2),16),
        g = parseInt(c.slice(2,4),16),
        b = parseInt(c.slice(4,6),16);
    r = Math.round(r + (255 - r) * amt);
    g = Math.round(g + (255 - g) * amt);
    b = Math.round(b + (255 - b) * amt);
    return '#' + [r,g,b].map(function(n){ return ('0'+n.toString(16)).slice(-2); }).join('');
  }

  // ---- generator tiap motif: kembalikan { w, h, markup } untuk satu ubin ----
  var MOTIFS = {

    // Kawung: empat kelopak mengelilingi pusat (irisan buah aren)
    kawung: function (fg) {
      return { w: 56, h: 56, markup:
        '<g fill="'+fg+'">' +
          '<ellipse cx="18" cy="18" rx="7" ry="13" transform="rotate(45 18 18)"/>' +
          '<ellipse cx="38" cy="18" rx="7" ry="13" transform="rotate(-45 38 18)"/>' +
          '<ellipse cx="18" cy="38" rx="7" ry="13" transform="rotate(-45 18 38)"/>' +
          '<ellipse cx="38" cy="38" rx="7" ry="13" transform="rotate(45 38 38)"/>' +
          '<circle cx="28" cy="28" r="3.2"/>' +
          '<circle cx="0" cy="0" r="2.6"/><circle cx="56" cy="0" r="2.6"/>' +
          '<circle cx="0" cy="56" r="2.6"/><circle cx="56" cy="56" r="2.6"/>' +
        '</g>' };
    },

    // Parang: bilah diagonal menerus + isen mlinjon
    parang: function (fg) {
      return { w: 30, h: 30, markup:
        '<line x1="0" y1="30" x2="30" y2="0" stroke="'+fg+'" stroke-width="10"/>' +
        '<line x1="0" y1="15" x2="15" y2="0" stroke="'+fg+'" stroke-width="1.6" stroke-dasharray="3 3"/>' +
        '<line x1="15" y1="30" x2="30" y2="15" stroke="'+fg+'" stroke-width="1.6" stroke-dasharray="3 3"/>' +
        '<rect x="4.5" y="4.5" width="4" height="4" fill="'+fg+'" transform="rotate(45 6.5 6.5)"/>' +
        '<rect x="19.5" y="19.5" width="4" height="4" fill="'+fg+'" transform="rotate(45 21.5 21.5)"/>' };
    },

    // Ceplok: roset simetri putar dalam kisi
    ceplok: function (fg) {
      var petals = '', i, a, cx, cy;
      for (i = 0; i < 8; i++) {
        a = i * 45;
        cx = 30 + 16 * Math.cos(a * Math.PI / 180);
        cy = 30 + 16 * Math.sin(a * Math.PI / 180);
        petals += '<ellipse cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" rx="3" ry="6" transform="rotate('+(a+90)+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')"/>';
      }
      return { w: 60, h: 60, markup:
        '<g fill="none" stroke="'+fg+'" stroke-width="1.4">' +
          '<circle cx="30" cy="30" r="19"/>' +
          '<circle cx="0" cy="0" r="9"/><circle cx="60" cy="0" r="9"/>' +
          '<circle cx="0" cy="60" r="9"/><circle cx="60" cy="60" r="9"/>' +
        '</g>' +
        '<g fill="'+fg+'">' + petals +
          '<circle cx="30" cy="30" r="4"/>' +
          '<circle cx="0" cy="0" r="2.5"/><circle cx="60" cy="0" r="2.5"/>' +
          '<circle cx="0" cy="60" r="2.5"/><circle cx="60" cy="60" r="2.5"/>' +
        '</g>' };
    },

    // Truntum: taburan bunga bintang kecil (lambang cinta yang tumbuh)
    truntum: function (fg) {
      function flower(cx, cy) {
        var s = '<circle cx="'+cx+'" cy="'+cy+'" r="2.4"/>', k, a, x, y;
        for (k = 0; k < 8; k++) {
          a = k * 45;
          x = cx + 6 * Math.cos(a * Math.PI / 180);
          y = cy + 6 * Math.sin(a * Math.PI / 180);
          s += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="1.5"/>';
        }
        return s;
      }
      return { w: 40, h: 40, markup:
        '<g fill="'+fg+'">' +
          flower(10, 10) + flower(30, 30) +
          '<circle cx="30" cy="10" r="1.6"/><circle cx="10" cy="30" r="1.6"/>' +
          '<circle cx="0" cy="0" r="1.3"/><circle cx="40" cy="0" r="1.3"/>' +
          '<circle cx="0" cy="40" r="1.3"/><circle cx="40" cy="40" r="1.3"/>' +
        '</g>' };
    },

    // Mega mendung: awan berlapis bergradasi (Cirebon)
    'mega-mendung': function (fg) {
      var scallop = 'q12 -15 24 0 q12 -15 24 0';
      return { w: 48, h: 32, markup:
        '<g fill="none" stroke-width="4.2">' +
          '<path d="M0 8 '+scallop+'" stroke="'+lighten(fg,0.55)+'"/>' +
          '<path d="M0 14 '+scallop+'" stroke="'+lighten(fg,0.38)+'"/>' +
          '<path d="M0 20 '+scallop+'" stroke="'+lighten(fg,0.20)+'"/>' +
          '<path d="M0 26 '+scallop+'" stroke="'+lighten(fg,0.04)+'"/>' +
          '<path d="M0 32 '+scallop+'" stroke="'+fg+'"/>' +
        '</g>' };
    }
  };

  var DEFAULTS = { motif: 'kawung', fg: '#7A3B12', bg: '#F3E7CB', scale: 1, opacity: 1, texture: false };

  function build(opts) {
    var o = {}, k;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    for (k in (opts || {})) if (opts[k] != null) o[k] = opts[k];

    var gen = MOTIFS[o.motif] || MOTIFS.kawung;
    var tile = gen(o.fg);
    var w = tile.w, h = tile.h;

    // filter goresan canting (opsional): sedikit wobble organik
    var filterDef = '', filterAttr = '';
    if (o.texture) {
      filterDef =
        '<filter id="canting" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feTurbulence type="turbulence" baseFrequency="0.08 0.12" numOctaves="2" seed="7" result="n"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>' +
        '</filter>';
      filterAttr = ' filter="url(#canting)"';
    }

    var content = '<g'+filterAttr+'>' + tile.markup + '</g>';
    var pattern =
      '<pattern id="p" patternUnits="userSpaceOnUse" width="'+w+'" height="'+h+'" ' +
        'patternTransform="scale('+o.scale+')">' + content + '</pattern>';

    var bgRect = o.bg && o.bg !== 'none' ? '<rect width="100%" height="100%" fill="'+o.bg+'"/>' : '';

    // ukuran svg = kelipatan ubin agar mulus di segala ukuran container
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="'+(w)+'" height="'+(h)+'" ' +
        'viewBox="0 0 '+w+' '+h+'">' +
        '<defs>'+filterDef+pattern+'</defs>' +
        bgRect +
        '<rect width="100%" height="100%" fill="url(#p)" fill-opacity="'+o.opacity+'"/>' +
      '</svg>';
    return svg;
  }

  var Batik = {
    version: '1.0.0',
    motifs: Object.keys(MOTIFS),

    // string SVG mentah (untuk disisipkan inline, mis. sebagai hiasan tepi)
    svg: function (opts) { return build(opts); },

    // nilai CSS background-image siap pakai: "url(...)"
    dataUri: function (opts) {
      return 'url("data:image/svg+xml,' + encodeURIComponent(build(opts)) + '")';
    },

    // pasang sebagai background ke elemen / selector
    apply: function (target, opts) {
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : (target.length != null ? target : [target]);
      var uri = this.dataUri(opts);
      Array.prototype.forEach.call(els, function (el) {
        el.style.backgroundImage = uri;
        el.style.backgroundRepeat = 'repeat';
      });
      return els;
    },

    // pindai semua elemen [data-batik] dan pasang otomatis
    scan: function (root) {
      var self = this;
      (root || document).querySelectorAll('[data-batik]').forEach(function (el) {
        self.apply(el, {
          motif: el.dataset.batik,
          fg: el.dataset.fg,
          bg: el.dataset.bg,
          scale: el.dataset.scale ? parseFloat(el.dataset.scale) : undefined,
          opacity: el.dataset.opacity ? parseFloat(el.dataset.opacity) : undefined,
          texture: el.dataset.texture === 'true'
        });
      });
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { Batik.scan(); });
    } else { Batik.scan(); }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = Batik;
  global.Batik = Batik;
})(typeof window !== 'undefined' ? window : this);
