'use strict';

localStorage.clear()

describe('model creation', function() {

  var localmodel = new LocalModel();

  it('should add a model to the models list', function() {
    var model = localmodel.addModel('Test', {
      name: LocalSchema.SchemaTypes.String
    });

    expect(localmodel.models.Test).toBe(model);
  });

});

describe('get model', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('Test', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should get the model by name', function() {
    var test = localmodel.model('Test');
    expect(test).toBe(model);
  });

  it('should return null when the model is invalid', function() {
    var foo = localmodel.model('Foo');
    expect(foo).toBe(null);
  });

});

describe('create', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestCreate', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should add an index for the new entry', function() {
    localStorage.clear();
    var test = model.create({
      name: 'foo'
    });
    var indices = localStorage.getItem('TestCreate-index');
    var parsed = JSON.parse(indices);
    expect(parsed.length).toBe(1);
  });

  it('should add an entry to localstorage', function() {
    localStorage.clear();
    var test = model.create({
      name: 'bla'
    });
    var indices = localStorage.getItem('TestCreate-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    expect(saved).toBe(JSON.stringify(test));
  });

});

describe('all', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestAll', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return all saved entries for a model', function() {
    localStorage.clear();
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.all();
    expect(results.length).toBe(2);
  });

});

describe('findById', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestFindById', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return the exact entry by ID', function() {
    localStorage.clear();
    var billy = model.create({ name: 'Billy' });
    var result = model.findById(billy._id);
    expect(result.name).toBe('Billy');
  });

  it('should return null when the ID isn\'t found', function() {
    localStorage.clear();
    var result = model.findById('1234');
    expect(result).toBe(null);
  });

});

describe('find', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestFind', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return all matching entries from a query', function() {
    localStorage.clear();
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find({ name: 'Billy' });
    expect(results.length).toBe(2);
    model.indices = null;
  });

  it('should return an empty array when storage is empty', function() {
    localStorage.clear();
    var results = model.find({ name: 'Billy' });
    expect(results.length).toBe(0);
    localStorage.clear();
  });

  it('should return all matching entries from a ' +
    'query with regular expression', function() {
      localStorage.clear();
      model.create({ name: 'Billy' });
      model.create({ name: 'Billy' });
      model.create({ name: 'Sammy' });
      var results = model.find({ name: /Bil/ });
      expect(results.length).toBe(2);
    });

  it('should return all when the query is missing', function() {
    localStorage.clear();
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find();
    expect(results.length).toBe(3);
  });

  it('should return all when the query is empty', function() {
    localStorage.clear();
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find({});
    expect(results.length).toBe(3);
  });

});
