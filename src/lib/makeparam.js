"use strict";
exports.__esModule = true;
exports.makeParam = function (paramName, paramValue) {
    return {
        paramName: paramName,
        paramValue: paramValue
    };
};
exports.makeRegexParam = function (paramName, params) {
    return {
        paramName: paramName,
        params: params
    };
};
/**
 *
 * @param {UriParams} source
 * @param {ExtractedPathParam} param
 * @param {RegexParams} regexParams
 * @returns {UriParams}
 */
exports.copyPathParams = function (source, param, regexParams) {
    var ret = { pathParams: source.pathParams.concat([param]) };
    if (regexParams) {
        if (source.regexParams) {
            ret.regexParams = source.regexParams.concat([regexParams]);
        }
        else {
            ret.regexParams = [regexParams];
        }
    }
    return ret;
};
