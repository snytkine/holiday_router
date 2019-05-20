//import * as chai from 'chai';
import {
  extractUriParam,
  splitBySeparator
} from '../lib/index';
import {expect} from 'chai';
import { ROUTE_PATH_SEPARATOR } from '../interfaces'

let URI1 = 'catalog/category/books/ABCD123'
let URI2 = 'isbn-1234/info'

describe('#Strlib functions', () => {

  describe('#extractUriParam', () => {
    it ('#Should extract param from uri', function () {

      let res = extractUriParam(URI1);

      expect(res.param).to.equal('catalog/');
      expect(res.rest).to.equal('category/books/ABCD123');

    })

    it ('#Should extract param with prefix from uri', function () {

      let res = extractUriParam(URI2, 'isbn-', '/');

      expect(res.param).to.equal('1234');
      expect(res.rest).to.equal('info');
    })

  })


  describe('#splitBySeparator', () => {

    it('#should split URL by path separator', () => {
      const res = splitBySeparator(URI1, [ROUTE_PATH_SEPARATOR]);
      expect(res.head).to.equal('catalog/')
      expect(res.tail).to.equal('category/books/ABCD123')
    })
  })

})
