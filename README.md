# LocalModel
[![Code Climate](https://codeclimate.com/github/RickCraig/localmodel/badges/gpa.svg)](https://codeclimate.com/github/RickCraig/localmodel) [![Test Coverage](https://codeclimate.com/github/RickCraig/localmodel/badges/coverage.svg)](https://codeclimate.com/github/RickCraig/localmodel/coverage) [![Build Status](https://travis-ci.org/RickCraig/localmodel.svg?branch=master)](https://travis-ci.org/RickCraig/localmodel)

LocalModel allows you to use a simple model structure to utilise localstorage. Its based loosely on the basic functionality of [Mongoose for node](http://mongoosejs.com/).

## Status
This library is currently under construction. I would advise against using it until it has been finished and tested thoroughly. I will updated this status when the time comes!

## Installation
There are multiple ways of installing LocalModel.

### Manually
Download the repo and copy dist/js/localmodel.min.js into the relevant folder in your application. Then include it on the page
```html
<script src='/path/to/localmodel.min.js'></script>
```

### CDN
Include the following in your HTML:
```html
<script src="linktocdn"></script>
```

### Bower
```
bower install localmodel
```
And include it on the page
```html
<script src="/bower_components/localmodel/dist/js/localmodel.min.js"></script>
```

## Usage
This will cover the basic usage of LocalModel:

- [Basic setup](#basic-setup)
- [Adding models](#adding-models)
- [Getting a model](#getting-a-model)
- [All](#all)
- [Find](#find)
- [Count](#count)
- [Find By ID](#find-by-id)
- [Using returned data](#using-returned-data)
- [Saving an updated entry](#saving-an-updated-entry)
- [Batch Update](#batch-update)
- [Removing/Deleting](#removingdeleting)
- [Population](#population)
- [Find and populate](#find-and-populate)

### Basic Setup
LocalModel needs to be instantiated. At the moment there are no options to pass:
```javascript
var localmodel = new LocalModel();
```
Once instanciated you can use it to add models.

#### Options
##### Storage
LocalModel will allow you to add an option to change the storage method, by default it is set to localStorage.
```javascript
// Default - use localStorage
var localmodel = new LocalModel();

// Use sessionStorage
var localmodel = new LocalModel({
  storage: sessionStorage
});
```
You could even add your own method of storage. Note that it must contain ```storage.setItem(key, value)```, ```storage.getItem(key)``` and ```storage.removeItem(key)``` to allow the full functionality of LocalModel (and stop and huge errors).
```javascript
var myStorage = {
  getItem: function(key) {
    console.log('Getting item with key: ' + key);
  },
  setItem: function(key, value) {
    console.log('Setting the value ' + value + ' for key ' + key);
  },
  removeItem: function(key) {
    console.log('Removing item with key: ' + key);
  }
};

var localmodel = new LocalModel({
  storage: myStorage
});
```

##### Debugging
To enable debugging set the options 'debug' to true, the default is false.
```javascript
var localmodel = new LocalModel({
  debug: true
});
```

### Adding Models
To add a basic model do the following:
```javascript
var human = localmodel.addModel('Human', {
  name: LocalSchema.SchemaTypes.String,
  age: LocalSchema.SchemaTypes.Number
});
```
LocalSchema currently has 4 types:
- String: 'string'
- Number: 'number'
- Boolean: 'boolean'
- Mixed: 'mixed'
- Date: 'date'

You can use the string (e.g. 'number', 'boolean') or the static variable (LocalSchema.LocalSchema.SchemaTypes.Number) but make sure when using the string that it's all lowercase and matches the static exactly.

When adding a model the 'addModel' function returns the created model instance.

#### Default Values
You can add a default value to a property when adding the model like so:
```javascript
var human = localmodel.addModel({
  name: LocalSchema.SchemaTypes.String,
  isAlive: { type: LocalSchema.SchemaTypes.Boolean, default: true }
});
```
This will set the isAlive property to true by default, this will simply be overwritten when the isAlive property is given a value:
```javascript
var sammy = human.create({ name: 'Sammy' });
console.log(sammy.isAlive); // true

var billy = human.create({ name: 'Billy', isAlive: false });
console.log(billy.isAlive); // false
```

### Getting a model
If you ever need to retrieve a model instance you can call the following:
```javascript
var human = localmodel.model('MyModel');
```

### Adding an entry
To add an entry to a model you just need to use the create function on the model instance.
```javascript
human.create({
  name: 'Sammy',
  age: 35
});
```

### All
All will return all of the entries relevant to the model used.
```javascript
var allTheHumans = human.all();
```

### Find
Find will allow you to use a query to find matching entries.
```javascript
var billys = human.find({
  name: 'Billy'
});

var certainAge = human.find({
  age: 35
});
```
You can also use regular expression to find partial matches.
```javascript
var partialMatches = human.find({
  name: /Sam/g
});
```
You can also return a count instead of an array by setting the second argument to true
```javascript
var totalHumansAgeTen = human.find({ age: 10 }, true);
```

#### $gte, $gt, $lte, $lt
You can use a more advanced query to get numbers and dates that are greater than or equal, greater than, less than or equal and less than:
```javascript
// Find with age greater than or equal to 25
var humans = human.find({ age: { $gte: 25 } });

// Find with age greater than 30
var humans = human.find({ age: { $gt: 30 } });

// Find with age less than or equal to 45
var humans = human.find({ age: { $lte: 45 } });

// Find with age less than to 50
var humans = human.find({ age: { $lt: 50 } });

// Find with age less than to 50 but greater than 20
var humans = human.find({ age: { $lt: 50, $gt: 20 } });

// Find all with a created date between 2010 and now
var human = human.find({ created: { $lte: new Date(), $gte: new Date(2010, 1, 1) } });
```

### Count
Count is a helper that returns a count of entries based on a query. It does the same thing as ```MyModel.find(query, true)```, but has better semantics.
```javascript
// Count all the humans
var totalHumans = human.count();

// Count humans with name 'Sammy'
var totalSammys = human.count({ name: 'Sammy' });
```

### Find By ID
If you have the ID of the entry you can quickly find it with ```findById(ID)```.
```javascript
var specificHuman = human.findById('af6fa5c5-e197-4e59-a04a-58d8af366554');
```

### Using Returned Data
Data returned from the ```.all()``` and ```.find()``` is returned in an array. Data returned from a ```.findById``` is returned as a single object. Individual objects are instances of ```LocalDocument``` which house the data inside a property named 'data'...
```javascript
var rick = human.findById('af6fa5c5-e197-4e59-a04a-58d8af366554');
console.log('Rick\'s age is: ' + rick.age);
```

### Saving an updated entry
You can alter a LocalDocument data object and save it using the ```.save()``` method.
```javascript
var rick = human.findById('af6fa5c5-e197-4e59-a04a-58d8af366554');

// Change the age and save it
rick.age = 32;
rick.save();
```

### Batch Updating
You can update multiple entries in a single call, utilising the find query mechanism.
```javascript
// Update all entries named 'Sammy' to be active
var numUpdated = human.update({ name: 'Sammy' }, { active: true });
```

### Removing/Deleting
You can remove an entry individually:
```javascript
// Remove rick, no one likes him anyway...
var rick = human.findById('af6fa5c5-e197-4e59-a04a-58d8af366554');
rick.remove();
```
or you can remove multiple entries using the same query mechanism as find from the model:
```javascript
// Remove all entries with age = 16
human.remove({ age: 16 });

// Remove all entries
human.remove();
```
The ```LocalModal.remove()``` function returns the number of entries removed

### Population
Population allows you to add a relationship between one model and another. To add a relation property just add a ref property to the configuration of a schema property.
```javascript
var Brand = localmodel,addModel('Brand', {
  name: LocalSchema.SchemaTypes.String,
  logo: LocalSchema.SchemaTypes.String
});

var Car = localmodel.addModel('Car', {
  model: LocalSchema.SchemaTypes.String
  brand: { type: LocalSchema.SchemaTypes.String, ref: 'Brand' }
});
```
The ref property takes a string, the name of the related model. By default the ref will use the _id of the related model as the foreign key. This means that when you populate a Car entry it will replace the property with an object.
```javascript
var aston = Brand.create({
  name: 'Aston Martin',
  logo: 'http://cdn.astonmartin.com/icons/logos/aml-logo-medium.png'
});

var dbNine = Car.create({ model: 'DB9 GT', brand: aston._id });

console.log(dbNine.populate('brand'));
```
Logs:
```javascript
// Basic object
{
  model: 'DB9 GT',
  brand: {
    _id: 'af6fa5c5-e197-4e59-a04a-58d8af366554',
    name: 'Aston Martin',
    logo: 'http://cdn.astonmartin.com/icons/logos/aml-logo-medium.png'
  }
}
```
Adding a foreign key to the property configuration will use a different property on the related to model to be used to populate:
```javascript
var Extra = localmodel.create('Extra', {
  pack: LocalSchema.SchemaTypes.String,
  name: LocalSchema.SchemaTypes.String,
  cost: LocalSchema.SchemaTypes.Number
});

var Car = localmodel.addModel('Car', {
  model: LocalSchema.SchemaTypes.String
  pack: { type: LocalSchema.SchemaTypes.String, ref: 'Extra', foreignKey: 'pack' }
});
```
When using a foreign key you open up the possibility of replacing the property with an array, because more than one entry in the related model could have a matching property:
```javascript
Extra.create({ name: 'Mud Flaps', pack: 'protection', cost: 20 });
Extra.create({ name: 'Rubber Mats', pack: 'protection', cost: 35 });
Extra.create({ name: 'Scotch Guard', pack: 'protection', cost: 15 });

var dbNine = Car.create({ model: 'DB9 GT', pack: 'protection' });
console.log(dbNine.populate('pack'));
```
Logs:
```javascript
// Basic object
{
  model: 'DB9 GT',
  pack: [
    {
      _id: 'af6fa5c5-e197-4e59-a04a-58d8af366554',
      name: 'Mud Flaps',
      pack: 'protection',
      cost: 20
    },
    {
      _id: 'af6fa5c5-e197-4e59-a04a-58d8af444355',
      name: 'Rubber Mats',
      pack: 'protection',
      cost: 35
    },
    {
      _id: 'af6fa5c5-e197-4e59-a04a-58d8af948829',
      name: 'Scotch Guard',
      pack: 'protection',
      cost: 15
    }
  ]
}
```
You can also name multiple properties to populate using a space separated string.
```javascript
// This will populate relatedProp and otherRelated properties
exampleThing.populate('relatedProp otherRelated');
```
#### Options
There a few options that will make using the populate feature more functional:
##### Match
match will allow you to add more conditions to returning related properties, this uses the same query logic as the find function.
```javascript
// This will only populate with extras that cost over 18
dbNine.populate('pack', {
  match: { cost: { $gt: 18 } }
});
```
##### Sort
To sort the populated data just pass in a [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):
```javascript
dbNine.populate('pack', {
  sort: function(a, b) {
    return a.cost > b.cost ? 1 : -1;
  }
});
```
##### Limit
If you would like to limit the populated data just pass limit with a number.
```javascript
dbNine.populate('pack', {
  limit: 2
});
```
##### Select
If you wish to only populate with selected properties from the related model, use the select option. To add multiple selections just use a space separated string:
```javascript
dbNine.populate('pack', {
  select: 'cost name'
});
```

### Find and populate
Find an populate works on exactly the same principle as [population](#population) but allows you to find an array of entries and batch populate them. It accepts the same options as LocalDocument.populate();
```javascript
Extra.create({ name: 'Mud Flaps', pack: 'protection', cost: 20 });
Extra.create({ name: 'Rubber Mats', pack: 'protection', cost: 35 });
Extra.create({ name: 'Scotch Guard', pack: 'protection', cost: 15 });

Car.create({ model: 'DB9 GT', pack: 'protection' });
Car.create({ model: 'DB9', pack: 'protection' });

var dbNines = Car.findAndPopulate({ name: /DB9/ }, 'pack', { limit: 1 });
console.log(dbNines);
```
Logs:
```
// Basic objects
[
  {
    model: 'DB9 GT',
    pack: [
      {
        _id: 'af6fa5c5-e197-4e59-a04a-58d8af366554',
        name: 'Mud Flaps',
        pack: 'protection',
        cost: 20
      }
    ]
  },
  {
    model: 'DB9',
    pack: [
      {
        _id: 'af6fa5c5-e197-4e59-a04a-58d8af366554',
        name: 'Mud Flaps',
        pack: 'protection',
        cost: 20
      }
    ]
  },
]
```

## ID Generation
Each ID is generated with a mixture of the date and random number generation. Each ID will be unique and can be accessed by the ```_id``` property.

## Contribution
I have developed this myself as a fun project, which I will continue to add to as long as I can think of things to add... If you have any issues or feature requests feel free to add an issue. If you have anything to improve this, feel free to add a pull request and I will review it for addition.

## Testing
Tests are run using jasmine. This project uses gulp as it's build tool.
```
npm test
```
or
```
gulp test
```

## Change Log
v0.5.0
- Add a basic aggregate function

v0.4.0
- Added populate feature
- Removed .data from local document
- Add references/relationships to other models

v0.3.1
- Minor optimisations

v0.3.0
- Add the option of using localsession
- Add Count helper
- Add batch update

v0.2.0:
- Add Delete/Remove
- Add a check for localstorage

v0.1.2:
- Add query date modifiers ($gt, $gte, $lt, $lte)
- Split off matching to it's own function

v0.1.1:
- Add property defaults

v0.1.0:
- Added instanced data
- Added save to data instance for updated
- Added the Date schema type

v0.0.2:
- Added query number modifiers ($gt, $gte, $lt, $lte)

## To Do
- Optimise/Refactor
