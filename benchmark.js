
var co = require('./');

function fun(done) {
  done();
}

function *gen() {

}

function thunkRunner(done) {
    function runBench() {
        var callback;
        while (callback = done) {
            done = null;
            callback(null, thunk);
        }  
    }
    function thunk(resume){
        done = resume;
    }
    setImmediate(runBench);
}

function promiseRunner(done) {
    function getPromise(val, err){
        return {
            then: function(error, resume) {
                done = function() { resume(err,val); }
            }
        }
    }
    function runBench() {
        var callback;
        while (callback = done) {
            done = null;
            callback(null, getPromise);
        }  
    }
    setImmediate(runBench);
}



suite('co()', function(){
  set('mintime', process.env.MINTIME | 0 || 2000)

  bench('promises',
    co(function *(){
      var getPromise = yield promiseRunner;
      yield getPromise(1);
      yield getPromise(2);
      yield getPromise(3);
    })
  )

  bench('async thunks',
    co(function *(){
      var thunk = yield thunkRunner;
      yield thunk;
      yield thunk;
      yield thunk;
    })
  )

  bench('arrays',
    co(function *(){
      yield setImmediate;
      yield [fun, fun, fun];
    })
  )

  bench('objects'
    co(function *(){
      yield setImmediate;
      yield {
        a: fun,
        b: fun,
        c: fun
      };
    })
  )

  bench('generators',
    co(function *(){
      yield setImmediate;
      yield gen();
      yield gen();
      yield gen();
    })
  )

  bench('generators delegated',
    co(function *(){
      yield setImmediate;
      yield* gen();
      yield* gen();
      yield* gen();
    })(done);
  })

  bench('generator functions',
    co(function *(){
      yield setImmediate;
      yield gen;
      yield gen;
      yield gen;
    })
  )
})
