# LocalModel
[![Code Climate](https://codeclimate.com/github/RickCraig/localmodel/badges/gpa.svg)](https://codeclimate.com/github/RickCraig/localmodel) [![Test Coverage](https://codeclimate.com/github/RickCraig/localmodel/badges/coverage.svg)](https://codeclimate.com/github/RickCraig/localmodel/coverage)

LocalModel allows you to use a simple model structure to utilise localstorage. Its based loosely on the basic functionality of [Mongoose for node](http://mongoosejs.com/).

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
- [Find By ID](#find-by-id)

### Basic Setup
LocalModel needs to be instantiated. At the moment there are no options to pass:
```javascript
var localmodel = new LocalModel();
```
Once instanciated you can use it to add models.

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
You can use the string ('number') or the static variable (LocalSchema.LocalSchema.SchemaTypes.Number) but make sure when using the string that it's all lowercase and matches the static exactly.

When adding a model the 'addModel' function returns the created model instance.

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

### Find By ID
If you have the ID of the entry you can quickly find it with ```findById(ID)```.
```javascript
var specificHuman = human.findById('af6fa5c5-e197-4e59-a04a-58d8af366554');
```

## ID Generation
Each ID is generated with a mixture of the date and random number generation. Each ID will be unique and can be accessed by the ```_id``` property.

## Contribution
I have developed this myself as a fun project, which I will continue to add to as long as I can think of things to add... If you have any issues or feature requests feel free to add an issue. If you have anything to improve this, feel free to add a pull request and I will review it for addition.

## To Do
- Add Tests
- Add query number modifiers ($gt. $gte, $lt, $lte)
