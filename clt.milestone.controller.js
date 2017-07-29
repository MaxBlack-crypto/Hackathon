/**
 * Created By :- Akshay
 * Created Date :- 09-06-2017 09:30 pm
 * Version :- 1.0.0
 * Updated By :- Girijashankar
 * Updated Date :- 16-06-2017 12:10 pm
 * Version :- 1.0.1
 * Updated By :- Girijashankar
 * Updated Date :- 23-06-2017 10:00 am
 * Version :- 1.0.2 - Bug fix in Pie Chart
 * Updated By :- Akshay
 * Updated Date :- 05-07-2017 12:44 pm
 * Version :- 1.0.3 - add submit proof functionality
 * Updated By :- Girijashankar
 * Created Date :- 06-07-2017 06:44 pm
 * Version :- 1.0.4 - send milestoneId and projectId in requestfund screen
 * Updated By :- Madhura
 * Created Date :- 11-07-2017 02:00 pm
 * Version :- 1.0.5
 */
(function () {
    'use strict';

var app =     angular
        .module('app')
        .controller('Milestone.MilestoneController', Controller)
        .directive('numbersOnly',  function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.toString().replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

    function Controller($window,$state,$rootScope, MilestoneService,ImageService,$scope,$stateParams,ProjectService,FlashService) {
        var vm = this;
        var val1 =  $stateParams.projName;
        var val2 =  $stateParams.projId;
        var val3 =  $stateParams.fundGoal;
        var val4 =  $stateParams.fundRaised;
        vm.projectnm = $stateParams.projName;
        var val7=$stateParams.status;
        vm.status=$stateParams.status;
        console.log('$stateParams.status=',$stateParams.status);
        $scope.sendAmt={};
        // #GM 160617 :- Data to be fetched from $stateParams, hardcoding to be replaced
        vm.description = $stateParams.description;
        vm.fundRaised = Number($stateParams.fundRaised);
        var myDonation = $stateParams.myDonation;
        vm.fundGoal = Number($stateParams.fundGoal);
        console.log('vm.fundGoal in mil cont==',vm.fundGoal);
        // #GM 210617 :- If fundRaised > fundGoal, fundGoal = vm.fundRaised
        if(vm.fundRaised>vm.fundGoal){
            vm.fundGoal = vm.fundRaised;
            //console.log('FG In = ',vm.fundGoal);
            //console.log('FR In = ',vm.fundRaised);
        }

        var fundBalance = vm.fundGoal - vm.fundRaised;
        var otherDonation = vm.fundRaised-myDonation;

        //breadcrumbs
        $scope.doTheBack = function() {
            window.history.back();
        };


      
        // #GM 210617 :- If fundRaised < 0, otherDonation = vm.fundRaised

        if(vm.fundRaised<0){
            fundBalance = vm.fundGoal - myDonation;
            otherDonation = vm.fundRaised;
        }

         $scope.labels = ["Other's Donataion", "My Donation", "Fund Balance"];
         $scope.labelsNgo = ["Fund Balance","Fund Raised"];//ngo
         $scope.data = [otherDonation, myDonation, fundBalance];
         $scope.dataNgo = [fundBalance, vm.fundRaised];//ngo
         $scope.options = {legend: {display: true,position:"bottom"}};
         $scope.colours = ['#337ab7', '#7bf230', '#ff944d'];
         $scope.coloursNgo = ['#337ab7', '#7bf230'];//ngo
console.log("vm.fundRaised==",vm.fundRaised);
console.log("fundBalance==",fundBalance);
        //send projname and projid to donate screen
        $scope.donate = function () {
            $state.go('donate',{projName:val1,projId:val2,fundGoal:val3,fundRaised:val4});
        };

        //go to requestfund page page
        $scope.showRequestFund = function (val1,val2,val3,val4) {
            console.log('val4 = ',val4);
            $state.go('requestfund',{milestoneId:val1,projectId:val2,milestoneActivity:val3,projectName:vm.projectnm,fundAllocated:val4});
        };

        //go to document page
        $scope.showDocument = function (val1,val2,val3) {
            $state.go('document',{milestoneId:val1,projectId:val2,milestoneName:val3,projectName:vm.projectnm});
        };

        $scope.showNgoDocument = function (val1,val2,val3,val4,val5,val6) {
            $state.go('uploadeddocs',{milestoneId:val1,projectId:val2,milestoneName:val3,milestoneActivity:val4,fundRequested:val5,description:val6,projectName:vm.projectnm});
        };

        $rootScope.sendAmount = function(amount) {
            $rootScope.sendAmt = angular.copy(amount);
            console.log('$rootScope.sendAmt=',$rootScope.sendAmt);
        };

        //Updates the selected milestone details
        vm.updateMilestone = function () {
          var status='Approved';
         var projid=val2;
            ProjectService.Update(projid, status)
                .then(function (result) {
                    FlashService.Success('Milestone updated');
                    //vm.reset();
                    //$state.go('project');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }


        vm.publishProject= function () {
          var status='Fund Allocated';
         var projid=val2;
            ProjectService.Update(projid, status)
                .then(function (result) {
                    FlashService.Success('Milestone updated');
                    //vm.reset();
                    //$state.go('project');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }



        //Fetch all milestones from the project milestone collection and store in the object
        var getByProjName = function() {
            MilestoneService.GetByProjname($stateParams.projId).then(function (project) {
                vm.milestone = project;
                console.log('vm.milestone==',vm.milestone);
            });
        };

        //#Madhura: get milestone details by Params
        var getDetailsByParams=function(){
          MilestoneService.GetDetailsByParams($stateParams.projId).then(function (milestone){
            //  vm.milestoneByParams= milestone;
                vm.milestone = milestone;
                console.log("milestone data =  =  ",milestone);
                    var milestones=[];
                    var obj = {};
                for(var i=0;i<milestone.length;i++){
                    var miles = milestone[i].Value.milestones;
                    if(miles != null){
                        for(var k=0;k<miles.length;k++){
                            console.log(miles);
                            var activity = miles[k].activities;
                            var milestoneId = miles[k].milestoneId;
                            var activities=[];
                            if(activity != null){
                                for(var j=0;j<activity.length;j++){
                                    var activityName = activity[j].activityName;
                                    var activityDesc = activity[j].activityImage;
                                    console.log('miles = ',miles);
                                    var actObj = {};
                                    actObj['activityName'] = activityName;
                                    actObj['activityDesc'] = activityDesc;
                                    activities.push(actObj);
                                }
                            }
                            if(i==0){
                                if(activities.length > 0){
                                    obj[milestoneId] = milestoneId;
                                    var singleMileStone = {};
                                    singleMileStone['milestoneName'] = miles[k].milestoneName;
                                    singleMileStone['milestoneBudget'] = miles[k].milestoneBudget;
                                    singleMileStone['activity'] = activities;
                                    milestones.push(singleMileStone);
                                }
                            } else
                            if(!obj[milestoneId]){
                                  if(activities.length > 0){
                                  obj[milestoneId] = milestoneId;
                                  var singleMileStone = {};
                                  singleMileStone['milestoneName'] = miles[k].milestoneName;
                                  singleMileStone['milestoneBudget'] = miles[k].milestoneBudget;
                                  singleMileStone['activity'] = activities;
                                  milestones.push(singleMileStone);
                                }
                            }
                        }
                    }

                }
                    vm.fundRaised = milestones;
                    console.log("activity   = ",vm.fundRaised);
                    vm.milestone = miles;
                    console.log('vm.milestone = ',vm.milestone);
                    //console.log('milestone',vm.milestone.length);
          });
        };
        //fetch image from db
        var getImageByProjId = function() {
            ImageService.GetImageByProjId($stateParams.projId).then(function (image) {
                vm.projectImage = image;
                if(image.length==0){
                    var myImageDetails = [];
                    var mySingleImage = {};
                    mySingleImage['imageUrl'] = "img/project/default";
                    mySingleImage['milestoneId'] = $stateParams.projId;
                    mySingleImage['projectId'] = $stateParams.projId;
                    mySingleImage['_id']    = $stateParams.projId;
                    myImageDetails.push(mySingleImage);
                    vm.projectImage = myImageDetails;
                }
            });
        };

        getByProjName();
        //getDetailsByParams();
        getImageByProjId();
    }

// function numbersOnly(){
//          return {
//         require: 'ngModel',
//         link: function (scope, element, attr, ngModelCtrl) {
//             function fromUser(text) {
//                 if (text) {
//                     var transformedInput = text.replace(/[^0-9]/g, '');

//                     if (transformedInput !== text) {
//                         ngModelCtrl.$setViewValue(transformedInput);
//                         ngModelCtrl.$render();
//                     }
//                     return transformedInput;
//                 }
//                 return undefined;
//             }            
//             ngModelCtrl.$parsers.push(fromUser);
//         }
//     };
//     }
    
})();


// app.directive('numbersOnly', function () {
//     return {
//         require: 'ngModel',
//         link: function (scope, element, attr, ngModelCtrl) {
//             function fromUser(text) {
//                 if (text) {
//                     var transformedInput = text.replace(/[^0-9]/g, '');

//                     if (transformedInput !== text) {
//                         ngModelCtrl.$setViewValue(transformedInput);
//                         ngModelCtrl.$render();
//                     }
//                     return transformedInput;
//                 }
//                 return undefined;
//             }            
//             ngModelCtrl.$parsers.push(fromUser);
//         }
//     };
// });