/**
 * Created by Osei Fortune on 7/2/15.
 */
angular.module('parse-starter.controllers')
    .controller('HomeCtrl',function ($scope,$state,$ionicPopup) {

        $scope.currentUser = Parse.User.current()._serverData;


        $scope.back = function () {
            $ionicHistory.goBack();
        };

        $scope.logout = function () {

            $ionicPopup.confirm({
                title: 'LOG OUT',
                template: 'Are you sure?',
                okType: 'button-balanced'
            }).then(function(res) {
                if(res) {
                    Parse.User.logOut();
                    $state.go('login');
                } else {
                }
            });



        };
    })
    .controller('UploadCtrl', ['$scope','Core','$http','Upload','$ionicLoading', '$cordovaGeolocation','$ionicPlatform', function($scope, Core,$http,Upload,$ionicLoading,$cordovaGeolocation,$ionicPlatform){
    var lng;
    var lat;
    var user = new Parse.User.current();
    $scope.username=user.get("username");
    $scope.name=user.get("fn");
    $scope.lname=user.get("ln");



    ionic.Platform.ready(function(){
             $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
            });
             
            var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };
     
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                 lat  = position.coords.latitude;
                 lng = position.coords.longitude;
               
                 
                var myLatlng = new google.maps.LatLng(lat, lng);
                 
                var mapOptions = {
                    center: myLatlng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };         
                
				var map = new google.maps.Map(document.getElementById("map"), mapOptions);  

				var marker = new google.maps.Marker({
						position: myLatlng,
						map: map,
						title: 'You are Here!'
					  });				
                 
                $scope.map = map;   
                $ionicLoading.hide();   
                 
                $scope.lat=lat;
                $scope.ln=lng;

            }, function(err) {
                $ionicLoading.hide();
                console.log(err);
            });
     

        });    



    $scope.upload = function (file) {
        var files ;
        Upload.upload({
            url: 'https://api.parse.com/1/files/'+file.name,
            method: 'POST',
            data: {file: file},
            headers: {
               'X-Parse-Application-Id': "gozCzNAeYNW0xNy1KOsEc44reIrmOaj53HRaWvtb",
               'X-Parse-REST-API-Key': "yVjapxTJY8kRtwWkrj1ruZnwPrIQXYHp6bC3SqNa",
               'Content-Type': 'video/mp4'
           }
        }).then(function (resp) {

   

            files = new Parse.File(file.name,file,"video/mp4");
            files.save().then(function(res){
                $ionicLoading.hide();
                console.log('New File: '+res._name);
            },function(error){
                console.log(error);
                 
            });

           var User = new Parse.User.current();
           var query = new Parse.Query(User);
            query.equalTo("objectId", User.id);
            query.first({
                success: function (User) {
                    User.save(null, {
                        success: function (user) {
                               
                            User.set("video", files);
                            User.set("latitude",lat.toString());
                            User.set("longitude",long.toString());

                            User.save();
                        }
                    });
                    console.log('Previous File: '+User.get("video")._name);
                }
            });

            console.log('Success ' + resp.config.data.file.name + ' uploaded.');

        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            
             var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
             if(progressPercentage>0)
             {
                $ionicLoading.show({
                template: '<ion-spinner icon="spiral"></ion-spinner><br/>Uploading Video & location Details!'
                });
             }

            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });

        };
    }]);
