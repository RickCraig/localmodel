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
    expect(saved).toBe(JSON.stringify(test.data));
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

  it('should return an empty array when the collection is empty', function() {
    localStorage.clear();
    model.indices = null;
    var results = model.all();
    expect(results.length).toBe(0);
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
    var result = model.findById(billy.data._id);
    expect(result.data.name).toBe('Billy');
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
    name: LocalSchema.SchemaTypes.String,
    age: LocalSchema.SchemaTypes.Number
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
  });

  it('should return all matching entries from a ' +
    'query with regular expression', function() {
      localStorage.clear();
      model.create({ name: 'Billy' });
      model.create({ name: 'Billy' });
      model.create({ name: 'Sammy' });
      var results = model.find({ name: /Bil/ });
      expect(results.length).toBe(2);
      model.indices = null;
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

  it('should skip a query item when its an empty string', function() {
    localStorage.clear();
    model.create({ name: 'Billy', age: 31 });
    model.create({ name: 'Sammy', age: 25 });
    var emptyString = model.find({ name: 'Billy', age: '' });
    expect(emptyString.length).toBe(1);
  });

  it('should skip a query item when its an empty object', function() {
    localStorage.clear();
    model.create({ name: 'Billy', age: 31 });
    model.create({ name: 'Sammy', age: 25 });
    var emptyObject = model.find({ name: 'Sammy', age: {} });
    expect(emptyObject.length).toBe(1);
  });

  it('should return an empty array when query doesn\'t match', function() {
    localStorage.clear();
    model.create({ name: 'Billy', age: 31 });
    model.create({ name: 'Sammy', age: 25 });
    var emptyObject = model.find({ name: 'Samuel' });
    expect(emptyObject.length).toBe(0);
  });

});

describe('Match object', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestMatch', {
    age: LocalSchema.SchemaTypes.Number
  });
  var addDummies = function() {
    model.create({ age: 31 });
    model.create({ age: 25 });
    model.create({ age: 15 });
    model.create({ age: 11 });
  };

  it('should return a number greater than or equal when using $gte', function() {
    localStorage.clear();
    addDummies();
    var results = model.find({ age: { $gte: 25 } });
    expect(results.length).toBe(2);
  });

  it('should return a number greater than when using $gt', function() {
    localStorage.clear();
    addDummies();
    var results = model.find({ age: { $gt: 25 } });
    expect(results.length).toBe(1);
  });

  it('should return a number less than or equal when using $lte', function() {
    localStorage.clear();
    addDummies();
    var results = model.find({ age: { $lte: 25 } });
    expect(results.length).toBe(3);
  });

  it('should return a number less than when using $lt', function() {
    localStorage.clear();
    addDummies();
    var results = model.find({ age: { $lt: 25 } });
    expect(results.length).toBe(2);
  });

});

describe('Save', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestSave', {
    age: LocalSchema.SchemaTypes.Number
  });

  it('should save the changes made to localstorage', function() {
    localStorage.clear();
    var human = model.create({ age: 31 });
    human.data.age = 35;
    human.save();
    var indices = localStorage.getItem('TestSave-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    saved = JSON.parse(saved);
    console.log(saved.age);
    expect(saved.age).toBe(35);
  });

  it('should not save data that is not in the schema', function() {
    localStorage.clear();
    var human = model.create({ age: 31 });
    human.data.name = 'Sammy';
    human.save();
    var indices = localStorage.getItem('TestSave-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    saved = JSON.parse(saved);
    expect(saved.name).toBe(undefined);
  });

});

describe('Generic LocalDocument', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestLocalDoc', {
    created: LocalSchema.SchemaTypes.Date
  });

  it('should parse a date when type is date', function() {

    var first = model.create({ created: Date.now() });
    var searched = model.findById(first.data._id);
    expect(searched.data.created instanceof Date).toBe(true);
  });

  it('should set the type to string when type is missing', function() {
    localStorage.clear();
    var testModel = localmodel.addModel('TestDefaultType', {
      test: {}
    });
    var first = testModel.create({ test: 'foo' });
    var searched = testModel.findById(first.data._id);
    expect(typeof searched.data.test).toBe('string');
  });

});

describe('Default values', function() {

  var localmodel = new LocalModel();
  var model = localmodel.addModel('TestDefault', {
    name: { type: LocalSchema.SchemaTypes.String, default: 'Billy' }
  });

  it('should create the entry with the default when the value is missing', function() {
    localStorage.clear();
    model.create({});
    var indices = localStorage.getItem('TestDefault-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    saved = JSON.parse(saved);
    expect(saved.name).toBe('Billy');
  });

  it('should create the entry with the value when it\'s present', function() {
    localStorage.clear();
    model.create({ name: 'Sammy' });
    var indices = localStorage.getItem('TestDefault-index');
    var parsed = JSON.parse(indices);
    var saved = localStorage.getItem(parsed[0]);
    saved = JSON.parse(saved);
    expect(saved.name).toBe('Sammy');
  });

  it('should display the default even if it wasn\t saved with it', function() {
    localStorage.clear();
    var sammy = model.create({ name: 'Sammy' });
    model.schema['age'] = { type: LocalSchema.SchemaTypes.Number, default: 10 };
    var searched = model.findById(sammy.data._id);
    expect(searched.data.age).toBe(10);
  });
});

