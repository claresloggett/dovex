
var
  // example supervised learning algorithm
  ml = {
    // categorical prediction
    'majority': function() {
      return {
        fit: function(data, x_exclude, y_predict, y_exclude, datatypes, distinct, callback, callback_error) {
          yvals = numeric.transpose(data)[y_predict]; 
          param = math.mode(yvals)[0];
          correct = 0;
          predictions = [];
          for (row in data) {
            predictions.push(param);
            if (data[row][y_predict] == param) {
              correct += 1;
            } 
          }
          callback({ 'training_score': correct / data.length, 'cross_validation_score': correct / data.length, 'predictions': predictions });
        },

        datatype: 'categorical',
        name: 'Baseline (majority class)',
      }
    },
    'logistic': function() { return server_side_predictor('logistic', 'categorical', 'Logistic Regression'); },
    'rf': function() { return server_side_predictor('rf', 'categorical', 'Random Forest'); },
    'svc': function() { return server_side_predictor('svc', 'categorical', 'Support Vector Classifier (SVC)'); },

    // numeric prediction
    'mean': function() {
      return {
        fit: function(data, x_exclude, y_predict, y_exclude, datatypes, distinct, callback, callback_error) {
          yvals = numeric.transpose(data)[y_predict]; 
          ymean = math.mean(yvals);
          predictions = [];
          for (row in data) {
            predictions.push(ymean);
          }
          // now calculate r squared => always zero
          // 1 - u/v, u=sum(err2) v=sum(t-m2)
          callback({ 'training_score': 0.0, 'cross_validation_score': 0.0, 'predictions': predictions });
        },

        datatype: 'numeric',
        name: 'Baseline (mean)',
      }
    },
    'linear': function() { return server_side_predictor('linear', 'numeric', 'Linear Regression'); },
    'svr': function() { return server_side_predictor('svr', 'numeric', 'Support Vector Regression'); },
  },

  server_side_predictor = function(method, datatype, name) {
      return {
        fit: function(data, x_exclude, y_predict, y_exclude, datatypes, distinct, callback, callback_error) {
          // x_exclude, y_predict, y_exclude, scale
          config = {
            method: method,
            'x_exclude': JSON.stringify(Array.from(x_exclude)), 
            'y_exclude': JSON.stringify(Array.from(y_exclude)),
            'y_predict': y_predict, // number
            'scale': '1',
            'datatype': JSON.stringify(datatypes),
            'distinct': JSON.stringify(distinct)
          }
          process_on_server(config, callback, callback_error);
        },

        datatype: datatype,
        name: name
      }
   },

  ajax_callback = function(callback) {
    return function(data) {
      callback(data['result']);
    }
  },

  process_on_server = function(config, callback, callback_error) {
    $.ajax({
      type: "POST",
      url: g['url'],
      data: config,
      success: ajax_callback(callback),
      error: callback_error,
      dataType: 'json'
    });
  };

