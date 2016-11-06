"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var EmptyError = Rx.EmptyError;
/** @test {average} */
describe('Observable.prototype.average', function () {
    function identity(x) {
        return x;
    }
    function transform(x) {
        return x * 2;
    }
    asDiagram('average(x => x * 2)')('should return the average of the doubled values for all elements', function () {
        var source = hot('--a--b--c--|', { a: 1, b: 2, c: 3 });
        var sourceSubs = '^          !';
        var expected = '-----------(r|)';
        expectObservable(source.average(transform)).toBe(expected, { r: 4 });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit error if source is empty', function () {
        var source = hot('-----|');
        var sourceSubs = '^    !';
        var expected = '-----#';
        expectObservable(source.average(transform)).toBe(expected, null, new EmptyError());
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should transform element value', function () {
        var source = hot('--a--|', { a: 21 });
        var sourceSubs = '^    !';
        var expected = '-----(x|)';
        expectObservable(source.average(transform)).toBe(expected, { x: 42 });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('default transform should return the sum of element values divided by the number of elements', function () {
        var source = hot('--a--b--c--|', { a: 1, b: 1, c: 1 });
        var sourceSubs = '^          !';
        var expected = '-----------(x|)';
        expectObservable(source.average()).toBe(expected, { x: 1 });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var source = hot('--a--b--c--d--e--|', { a: 2, b: 4, c: 5, d: 10 });
        var sourceSubs = '^      !          ';
        var expected = '--------          ';
        var unsub = '       !          ';
        var result = source.average(transform);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should not break unsubscription chains when result Observable is unsubscribed', function () {
        var source = hot('--a--b--c--d--e--|', { a: 2, b: 4, c: 6, d: 10 });
        var sourceSubs = '^      !          ';
        var expected = '--------          ';
        var unsub = '       !          ';
        var result = source
            .mergeMap(function (x) { return Observable.of(x); })
            .average(transform)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should propagate error if transform eventually throws', function () {
        var source = hot('--a--b--c--d--e--|');
        var sourceSubs = '^       !';
        var expected = '--------#';
        function faultyPredicate(x) {
            if (x === 'c') {
                throw 'error';
            }
            return x;
        }
        expectObservable(source.average(faultyPredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should propagate error if transform eventually throws on Array source', function () {
        var source = Observable.of(5, 10, 15, 20);
        var expected = '#';
        function faultyPredicate(x) {
            if (x === 15) {
                throw 'error';
            }
            return x;
        }
        expectObservable(source.average(faultyPredicate)).toBe(expected);
    });
    it('should raise error if source raises error', function () {
        var source = hot('--#');
        var sourceSubs = '^ !';
        var expected = '--#';
        expectObservable(source.average(identity)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should not complete if source never emits', function () {
        var source = cold('-');
        var sourceSubs = '^';
        var expected = '-';
        expectObservable(source.average(identity)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should not count elements before subscription', function () {
        var source = hot('--z--^--a--|', { a: 5, z: 15 });
        var sourceSubs = '^     !';
        var expected = '------(x|)';
        expectObservable(source.average(transform)).toBe(expected, { x: 10 });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should raise error if source raises error after subscription', function () {
        var source = hot('--z--^--#');
        var sourceSubs = '^  !';
        var expected = '---#';
        expectObservable(source.average(identity)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should raise error if source does not emit after subscription', function () {
        var source = hot('--z--^-----|');
        var sourceSubs = '^     !';
        var expected = '------#';
        expectObservable(source.average(transform)).toBe(expected, null, new EmptyError());
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
});
//# sourceMappingURL=average-spec.js.map