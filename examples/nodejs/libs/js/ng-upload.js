// Version 0.3.6
// AngularJS simple file upload directive
// this directive uses an iframe as a target
// to enable the uploading of files without
// losing focus in the ng-app.
//
// <div ng-app="app">
//   <div ng-controller="mainCtrl">
//    <form action="/uploads" ng-upload> 
//      <input type="file" name="avatar"></input>
//      <input type="submit" value="Upload" 
//         upload-submit="submited(content, completed)"></input>
//    </form>
//  </div>
// </div>
//
//  angular.module('app', ['ngUpload'])
//    .controller('mainCtrl', function($scope) {
//      $scope.submited = function(content, completed) {
//        if (completed) {
//          console.log(content);
//        }
//      }  
//  });
//
angular.module('ngUpload', [])
  .directive('uploadSubmit', ['$parse', function($parse) {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        // Options (just 1 for now) 
        // Each option should be prefixed with 'upload-options-' or 'uploadOptions'
        // {
        //    // specify whether to enable the submit button when uploading forms
        //    enableControls: bool 
        // }
        var options = {};
        options.enableControls = attrs.uploadOptionsEnableControls;

        // submit the form - requires jQuery
        var form = angular.element(element).parents('form'); 

        // Retrieve the callback function
        var fn = $parse(attrs.uploadSubmit);

        if (!angular.isFunction(fn)) {
            var message = "The expression on the ngUpload directive does not point to a valid function.";
            throw message + "\n";
        }

        element.bind('click', function($event) {
          // prevent default behavior of click
          if ($event) {
            $event.preventDefault = true;
          }

          if (element.attr('disabled')) {
            return;
          }

          // create a new iframe
          var iframe = angular.element("<iframe id='upload_iframe' name='upload_iframe' border='0' width='0' height='0' style='width: 0px; height: 0px; border: none; display: none' />");

          // add the new iframe to application
          form.parent().append(iframe);

          // attach function to load event of the iframe
          iframe.bind('load', function () {
            // get content - requires jQuery
            var content = iframe.contents().find('body').html();
            // execute the upload response function in the active scope
            scope.$apply(function () { 
              fn(scope, { content: content, completed: true});
            });
            // remove iframe
            if (content !== "") { // Fixes a bug in Google Chrome that dispose the iframe before content is ready.
                setTimeout(function () { iframe.remove(); }, 250);
            }
            element.attr('disabled', null);
            element.attr('title', 'Click to start upload.');
          });

          scope.$apply(function () { 
            fn(scope, {content: "Please wait...", completed: false }); 
          });

          var enabled = true;
          if (!options.enableControls) {
              // disable the submit control on click
              element.attr('disabled', 'disabled');
              enabled = false;
          }
          // why do we need this???
          element.attr('title', (enabled ? '[ENABLED]: ' : '[DISABLED]: ') + 'Uploading, please wait...');

          form.submit();

        }).attr('title', 'Click to start upload.');
      }
    };
  }])
  .directive('ngUpload', ['$parse', function ($parse) {
    return {
      restrict: 'AC',
      link: function (scope, element, attrs) {
        element.attr("target", "upload_iframe");
        element.attr("method", "post");
        // Append a timestamp field to the url to prevent browser caching results
        var separator = element.attr("action").indexOf('?')==-1 ? '?' : '&';
        element.attr("action", element.attr("action") + separator + "_t=" + new Date().getTime());
        element.attr("enctype", "multipart/form-data");
        element.attr("encoding", "multipart/form-data");
      }
    };
  }]);
