'use strict';

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
    var test = model.create({
      name: 'foo'
    });
    var indices = localStorage.getItem('TestCreate-index');
    var parsed = JSON.parse(indices);
    expect(parsed.length).toBe(1);
    localStorage.clear();
  });

  it('should add an entry to localstorage', function() {
    var test = model.create({
      name: 'bla'
    });
    var indices = localStorage.getItem('TestCreate-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    expect(saved).toBe(JSON.stringify(test));
    localStorage.clear();
  });

});

describe('all', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestAll', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return all saved entries for a model', function() {
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.all();
    expect(results.length).toBe(2);
    localStorage.clear();
  });

});

describe('findById', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestFindById', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return the exact entry by ID', function() {
    var billy = model.create({ name: 'Billy' });
    var result = model.findById(billy._id);
    expect(result.name).toBe('Billy');
    localStorage.clear();
  });

  it('should return null when the ID isn\'t found', function() {
    var result = model.findById('1234');
    expect(result).toBe(null);
    localStorage.clear();
  });

});

describe('find', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestFind', {
    name: LocalSchema.SchemaTypes.String
  });

  it('should return all matching entries from a query', function() {
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find({ name: 'Billy' });
    expect(results.length).toBe(2);
    localStorage.clear();
  });

  it('should return and empty array when storage is empty', function() {
    var results = model.find({ name: 'Billy' });
    expect(results.length).toBe(0);
    localStorage.clear();
  });

  it('should return all matching entries from a ' +
    'query with regular expression', function() {
      model.create({ name: 'Billy' });
      model.create({ name: 'Billy' });
      model.create({ name: 'Sammy' });
      var results = model.find({ name: /Bil/ });
      expect(results.length).toBe(2);
      localStorage.clear();
    });

  it('should return all when the query is missing', function() {
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find();
    expect(results.length).toBe(3);
    localStorage.clear();
  });

  it('should return all when the query is empty', function() {
    model.create({ name: 'Billy' });
    model.create({ name: 'Billy' });
    model.create({ name: 'Sammy' });
    var results = model.find({});
    expect(results.length).toBe(3);
    localStorage.clear();
  });

});
