/**
 * R2 NUSANTARA — Product Visual Fallbacks
 * Visual-only configuration. Does not alter product/API data.
 * Sources are generic/open-license imagery and must never be treated as brand photography.
 */
(function () {
  'use strict';

  const WIKIMEDIA = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

  window.R2ProductImageFallback = Object.freeze({
    version: '1.0.0',
    aspectRatio: '4 / 5',
    generic: WIKIMEDIA + 'Cigaret%20tobacco.JPG',
    category: Object.freeze({
      'r2 slop': WIKIMEDIA + 'Cigaret%20tobacco.JPG',
      'resmi slop': WIKIMEDIA + 'Feuille%20tabac.jpg',
      'resmi bal': WIKIMEDIA + 'Belgian%20cigarette%20pack%20%28generic%29.jpg'
    }),
    get(category) {
      const key = String(category || '').trim().toLowerCase();
      return this.category[key] || this.generic;
    }
  });
})();
