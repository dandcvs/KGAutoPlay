// These will allow quick selection of the buildings which consume energy
var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];
var spcContChamber = gamePage.space.meta[5].meta[1];
var spcEntangler = gamePage.space.meta[10].meta[0];

 // These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var FreeEnergy = 0;
var deadScript = "Script is dead";
var Iinc = 0;
var goldebBuildings = ["temple","tradepost"];
var AutoEnergyControl = true;
var ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats" && tab.visible));



var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | ScriptKittiesMod </a>' +

'<div id="optionSelect" style="display:none; margin-top:-130px; margin-left:-30px; width:200px" class="dialog help">' +
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br></br>' +
'<button id="autoEnergy" style="color:black" onclick="autoSwitchEnergy(AutoEnergyControl,  \'autoEnergy\')"> Energy Control </button></br>' +
'</div>' +
'</div>'

$("#footerLinks").append(htmlMenuAddition);

function selectOptions() {
	$("#optionSelect").toggle();
}
function clearOptionHelpDiv() {
	$("#optionSelect").hide();
}

function clearScript() {
	$("#farRightColumn").remove();
	$("#buildingSelect").remove();
	$("#spaceSelect").remove();
	$("#scriptOptions").remove();
	clearInterval(runAllAutomation);
	autoBuildCheck = null;
	bldSelectAddition = null;
	spaceSelectAddition = null;
	htmlMenuAddition = null;
}

function autoSwitchEnergy(varCheck, varName) {
	if (!varCheck) {
		AutoEnergyControl = true;
		gamePage.msg('Auto energy is now on');
		document.getElementById(varName).style.color = 'black';
	} else if (varCheck) {
		AutoEnergyControl = false;
		gamePage.msg('Auto energy is now off');
		document.getElementById(varName).style.color = 'red';
	}
}


/* These are the functions which are controlled by the runAllAutomation timer */

// Auto Observe Astronomical Events
function autoObserve() {
		var checkObserveBtn = document.getElementById("observeBtn");
		if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
			document.getElementById('observeBtn').click();
		}
}

//Auto praise the sun
function autoPraise(){
	if (gamePage.religionTab.visible) {
	    if (gamePage.religion.meta[1].meta[5].val == 1) {
            if (gamePage.religion.getProductionBonus() < 900){
                gamePage.religion.praise();
            }
            else if (gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)')))).length > 0){
                var btn = gamePage.tabs[5].rUpgradeButtons;
                for (var i = 0; i < btn.length; i++) {
                    if (btn[i].model.enabled && btn[i].model.visible) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Religion researched ' + btn[i].model.name);
                                }
                                });
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
                if (gamePage.resPool.get("faith").value == gamePage.resPool.get("faith").maxValue){
                    gamePage.religion.praise();
                }
            }
            else if (gamePage.religion.getProductionBonus() < 980){
                gamePage.religion.praise();
            }
            else if ( (gamePage.religion.faith / gamePage.religion.getFaithBonus()) >  gamePage.resPool.get("faith").maxValue * 10){
                gamePage.religionTab.resetFaithInternal(1.01);
            }
            else if (gamePage.resPool.get("faith").value == gamePage.resPool.get("faith").maxValue){
                    gamePage.religion.praise();
            }
            if (gamePage.religion.getRU("transcendence").on){
                var tclevel = gamePage.religion.getTranscendenceLevel();
                //Transcend one Level at a time
                var needNextLevel = gamePage.religion.getTranscendenceRatio(tclevel+1) - gamePage.religion.getTranscendenceRatio(tclevel);
                if (gamePage.religion.faithRatio > needNextLevel) {

                    gamePage.religion.faithRatio -= needNextLevel;
                    gamePage.religion.tcratio += needNextLevel;
                    gamePage.religion.tclevel += 1;

                    self.game.msg($I("religion.transcend.msg.success", [gamePage.religion.tclevel]));
                }
            }
	    } else if ((gamePage.resPool.get("faith").value == gamePage.resPool.get("faith").maxValue) && gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)')))).length > 0){
                var btn = gamePage.tabs[5].rUpgradeButtons;
                for (var i = 0; i < btn.length; i++) {
                    if (btn[i].model.enabled && btn[i].model.visible) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Religion researched ' + btn[i].model.name);
                                }
                                });
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
                if (gamePage.resPool.get("faith").value == gamePage.resPool.get("faith").maxValue){
                    gamePage.religion.praise();
                }
        } else if (gamePage.resPool.get("faith").value == gamePage.resPool.get("faith").maxValue){
              gamePage.religion.praise();
        }
	}
}

// Build buildings automatically
function autoBuild() {
        if (gamePage.ui.activeTabId != 'Bonfire'){
            gamePage.tabs[0].update();
        }
        var btn = gamePage.tabs[0].buttons.filter(res => res.model.enabled && res.model.metadata && res.model.metadata.unlocked);
        for (i = 0 ;i < btn.length; i++) {
             if (goldebBuildings.includes(btn[i].model.metadata.name)){
                   if ((gamePage.religion.getRU('solarRevolution').val == 1) || (btn[i].model.metadata.name == 'temple' &&  btn[i].model.metadata.val < 3) || (btn[i].model.prices.filter(res => res.name == 'gold')[0].val < (gamePage.resPool.get('gold').value - 500)) || (gamePage.resPool.get('gold').value == gamePage.resPool.get('gold').maxValue) ) {
                              try {
                                    btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                    if (result) {
                                        btn[i].update();
                                        gamePage.msg('Build ' + btn[i].model.name );
                                    }
                                    });
                              } catch(err) {
                                console.log(err);
                              }
                         }
             }
             else if (btn[i].model.metadata.name == "aiCore"){
                 if (btn[i].model.metadata.val/5 < spcEntangler.val){
                    try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                            if (result) {
                                btn[i].update();
                                gamePage.msg('Build ' + btn[i].model.name );
                            }
                            });
                     } catch(err) {
                         console.log(err);
                     }
                 }
             }
             else {
                     try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                            if (result) {
                                btn[i].update();
                                gamePage.msg('Build ' + btn[i].model.name );
                            }
                            });
                     } catch(err) {
                         console.log(err);
                     }
             }
        }
}

// Build space stuff automatically
function autoSpace() {
    if (gamePage.spaceTab.visible) {
        // Build space buildings
        gamePage.tabs[6].update();
        for (var z = 0; z < gamePage.tabs[6].planetPanels.length; z++) {
                var spBuild = gamePage.tabs[6].planetPanels[z].children;
                try {
                    for (i = 0 ;i < spBuild.length; i++) {
                        if (spBuild[i].model.metadata.unlocked) {
                            spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
                                if (result) {
                                    spBuild[i].update();
                                    gamePage.msg('Build in Space ' + spBuild[i].model.name);
                                }
                                });
                        }
                    }
                } catch(err) {
                console.log(err);
                }
        }
        // Build space programs
        var spcProg = gamePage.tabs[6].GCPanel.children;
        for (var i = 0; i < spcProg.length; i++) {
            if (spcProg[i].model.metadata.unlocked && spcProg[i].model.on == 0) {
                try {
                    spcProg[i].controller.buyItem(spcProg[i].model, {}, function(result) {
                        if (result) {
                            spcProg[i].update();
                            gamePage.msg('Research Space program ' + spcProg[i].model.name );
                        }
                        });
                } catch(err) {
                console.log(err);
                }
            }
        }
	}
}

// Trade automatically
function autoTrade() {
        if  (gamePage.resPool.get('uranium').value < 100 && gamePage.diplomacy.get('dragons').unlocked) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), 1);
        }
        if (gamePage.resPool.get('titanium').value < 20000 && gamePage.diplomacy.get('zebras').unlocked) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"), 1);
        }
        else{
            var titRes = gamePage.resPool.get('titanium');
            var ironRes = gamePage.resPool.get('iron');
            var unoRes = gamePage.resPool.get('unobtainium');
            var woodRes = gamePage.resPool.get('wood');
            var goldResource = gamePage.resPool.get('gold');
            var goldOneTwenty = gamePage.getResourcePerTick('gold') * 200;
                if (goldResource.value > (goldResource.maxValue - goldOneTwenty)) {
                    if (gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
                        if (unoRes.value / unoRes.maxValue > 0.3){
                            gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
                        }else if(unoRes.value > 5000 && gamePage.timer.ticksTotal % 755 === 0) {
                            gamePage.diplomacy.trade(game.diplomacy.get("leviathans"));
                        }
                        //Feed elders
                        if (gamePage.resPool.get("necrocorn").value >= 1 && gamePage.diplomacy.get("leviathans").energy < gamePage.religion.getZU("marker").val * 5 + 5){
                            gamePage.diplomacy.feedElders();
                        }
                    } else if (titRes.value < (titRes.maxValue * 0.9)  && gamePage.diplomacy.get('zebras').unlocked) {
                        gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"), (goldOneTwenty / 15));
                    } else if ((ironRes.value < (ironRes.maxValue * 0.9)) && (woodRes.value > (woodRes.maxValue * 0.8)) && gamePage.diplomacy.get('griffins').unlocked) {
                        gamePage.diplomacy.tradeAll(game.diplomacy.get("griffins"), (goldOneTwenty / 15));
                    } else if (gamePage.diplomacy.get('dragons').unlocked) {
                        gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), (goldOneTwenty / 15));
                    }
                }
        }
}

// Hunt automatically
function autoHunt() {
    var tmpvalue =  gamePage.resPool.get('furs').value
	var catpower = gamePage.resPool.get('manpower');
		if (catpower.value > (catpower.maxValue - 1) || (tmpvalue/catpower.maxValue < 0.02)) {
			gamePage.village.huntAll();
		}
}

var resources = [
       		["catnip", "wood", 50],
            ["wood", "beam", 175],
        	["minerals", "slab", 250],
        	["iron", "plate", 125],
            ["oil", "kerosene", 7500],
            ["uranium", "thorium", 250],
			["unobtainium", "eludium", 1000]
                ];

var resourcesAll = [
    ["beam", [["wood",175]],10],
    ["slab", [["minerals",250]],25],
    ["steel", [["iron",100],["coal",100]],500],
    ["plate", [["iron",125]],150],
    ["concrate", [["steel",25],["slab",2500]],500],
    ["gear", [["steel",15]],500],
    ["alloy", [["steel",75],["titanium",10]],1000],
    ["eludium", [["unobtainium",1000],["alloy",2500]],1000],
    ["scaffold", [["beam",50]],1000],
    ["ship", [["scaffold",100],["plate",150],["starchart",25]],500],
    ["kerosene", [["oil",7500]],0],
    ["parchment", [["furs",175]],0],
    ["manuscript", [["parchment",25],["culture",400]],35],
    ["compedium", [["manuscript",50],["science",10000]],0],
    ["blueprint", [["compedium",25],["science",25000]],0],
    ["thorium", [["uranium",250]],0],
    ["megalith", [["slab",50],["plate",5]],0],
]

function autoCraft2() {
        if (gamePage.workshopTab.visible) {
            var flag = true;
            var cnt = 0;
            var resourcesAllF = resourcesAll.filter(res => gamePage.workshop.getCraft(res[0]).unlocked).sort(function(a, b) {
                return (gamePage.resPool.get(a[0]).value - gamePage.resPool.get(b[0]).value);
                             });
            for (var i = 0; i < resourcesAllF.length; i++) {
                var curResTarget = gamePage.resPool.get(resourcesAllF[i][0]);
                if (gamePage.workshop.getCraft(resourcesAllF[i][0]).unlocked) {
                     flag = true;
                     cnt = 0;
                     if (curResTarget.value <= Math.min(resourcesAllF[i][2] , gamePage.resPool.get('paragon').value)) {
                        if (gamePage.resPool.get(resourcesAllF[i][1][0][0]).value >= resourcesAllF[i][1][0][1]) {
                             for (var x = 0; x < resourcesAllF[i][1].length; x++) {
                                cnt = Math.min(cnt != 0 ? cnt : Math.ceil((gamePage.resPool.get(resourcesAllF[i][1][x][0]).value / resourcesAllF[i][1][x][1])/2),Math.ceil((gamePage.resPool.get(resourcesAllF[i][1][x][0]).value / resourcesAllF[i][1][x][1])/2));
                             }
                        }
                     }
                     else{
                         for (var x = 0; x < resourcesAllF[i][1].length; x++) {
                                    tmpvalue =  gamePage.resPool.get(resourcesAllF[i][1][x][0]).value
                                    tmpvalueMax =  gamePage.resPool.get(resourcesAllF[i][1][x][0]).maxValue
                                    if ((tmpvalue < resourcesAllF[i][1][x][1]) || (tmpvalueMax == 0 && curResTarget.value > tmpvalue)) {
                                        flag = false;
                                    }
                                    else if (tmpvalueMax != 0 && ((curResTarget.value < tmpvalue && tmpvalue/tmpvalueMax < 0.3) || (curResTarget.value >= tmpvalue && tmpvalue/tmpvalueMax < 0.9))) {
                                        flag = false;
                                    }
                                    else {
                                        if ((cnt > (tmpvalue / resourcesAllF[i][1][x][1])) || (cnt == 0)) {
                                            cnt = Math.ceil(tmpvalue / resourcesAllF[i][1][x][1]/2);
                                        }
                                    }
                         }
                     }

                     if (flag == true && cnt > 0) {
                        if (resourcesAllF[i][0] == "ship") {
                            if (gamePage.resPool.get("ship").value < 5000 || gamePage.resPool.get("starchart").value > 1500){
                                gamePage.craft(resourcesAllF[i][0], cnt);
                            }
                        }
                        else {
                           gamePage.craft(resourcesAllF[i][0], cnt);
                        }
                     }
                }
            }
            for (var i = 0; i < resources.length; i++) {
                var curRes = gamePage.resPool.get(resources[i][0]);
                var resourcePerTick = gamePage.getResourcePerTick(resources[i][0], 0);
                var resourcePerCraft = (resourcePerTick * 3);
                if (curRes.value > (curRes.maxValue - resourcePerCraft) && gamePage.workshop.getCraft(resources[i][1]).unlocked) {
                    gamePage.craft(resources[i][1], (resourcePerCraft / resources[i][2]));
                }
            }
	    }
}


// Auto Research
function autoResearch() {
    if (gamePage.libraryTab.visible != false) {
        gamePage.tabs[2].update();
        var btn = gamePage.tabs[2].buttons.filter(res => res.model.visible);
        for (var i = 0; i < btn.length; i++) {
            if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
                try {
                    btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                        if (result) {
                            btn[i].update();
                            gamePage.msg('Researched ' + btn[i].model.name );
                        }
                    });
                } catch(err) {
                console.log(err);
                }
            }
        }
    }
}

// Auto Workshop upgrade
function autoWorkshop() {
    if (gamePage.workshopTab.visible != false) {
         gamePage.tabs[3].update();
         var btn = gamePage.tabs[3].buttons.filter(res => res.model.visible);
         for (var i = 0; i < btn.length; i++) {
            if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
                try {
                    btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                        if (result) {
                            btn[i].update();
                            gamePage.msg('Upgraded ' + btn[i].model.name );
                        }
                    });
                } catch(err) {
                console.log(err);
                }
            }
        }
    }
}

// Festival automatically
function autoParty() {
	if (gamePage.science.get("drama").researched) {
		var catpower = gamePage.resPool.get('manpower').value;
		var culture = gamePage.resPool.get('culture').value;
		var parchment = gamePage.resPool.get('parchment').value;

		if (catpower > 1500 && culture > 5000 && parchment > 2500) {
			if (gamePage.calendar.festivalDays < 400*30) {
				gamePage.village.holdFestival(1);
			}
		}
	}
}

function autozig() {
    gamePage.religionTab.update();
    var btn = [gamePage.religionTab.sacrificeBtn,gamePage.religionTab.sacrificeAlicornsBtn]
    for (var i = 0; i < btn.length; i++) {
		if (btn[i] && btn[i].model.visible == true) {
			try {
				btn[i].controller.sacrificeAll(btn[i].model, {}, function(result) {
					if (result) {btn[i].update();}
					});
			} catch(err) {
			console.log(err);
			}
		}
	}

	if(gamePage.religionTab.zgUpgradeButtons.filter(res => res.model.enabled).length > 0){
        zig = gamePage.religionTab.zgUpgradeButtons.sort(function(a, b) {
                    a1 = a.model.metadata.effects.alicornPerTick;
                    a2 = a.model.metadata.effects.unicornsRatioReligion
                    b1 = b.model.metadata.effects.alicornPerTick;
                    b2 = b.model.metadata.effects.unicornsRatioReligion
                    if (!a1){a1 = 0};
                    if (!a2){a2 = 0};
                    if (!b1){b1 = 0};
                    if (!b2){b2 = 0};

                    return ((a1 + a2) - (b1 + b2));
                 });

        var btn = zig;
        for (var i = btn.length - 1; i >= 0; i--) {
            if (btn[i] && btn[i].model.metadata.unlocked ) {
                try {
                    btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                        if (result) {
                        btn[i].update();
                        gamePage.msg('Build ' + btn[i].model.name );
                        }
                        });
                } catch(err) {
                console.log(err);
                }
            }
        }
	}

	if (gamePage.resPool.get('tears').value > 10000 && gamePage.resPool.get('sorrow').value < gamePage.resPool.get('sorrow').maxValue){
        var btn = [gamePage.religionTab.refineBtn]
        for (var i = 0; i < btn.length; i++) {
            if (btn[i] && btn[i].model.visible == true) {
                try {
                     btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                        if (result) {btn[i].update();}
                        });
                } catch(err) {
                console.log(err);
                }
            }
        }
	}
}

// Auto assign new kittens to selected job
function autoAssign() {
        var resourcesAssign = [
       		["catnip", "farmer",9,1],
            ["wood", "woodcutter",1,2],
        	["minerals", "miner",1,2],
            ["science", "scholar",1,5],
        	["manpower", "hunter",1,5],
            ["faith", "priest",15,15],
            (gamePage.resPool.get("coal").value / gamePage.resPool.get("coal").maxValue  || 100) < (gamePage.resPool.get("gold").value / gamePage.resPool.get("gold").maxValue || 100) ? ["coal", "geologist",1,15] : ["gold", "geologist",1,15]
                ];
	    let restmp = resourcesAssign.filter(res => res[0] in gamePage.village.getJob(res[1]).modifiers &&  gamePage.village.getJob(res[1]).unlocked);
	    if  (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.currentChallenge == 'atheism'){
	         restmpq = restmp.sort(function(a, b) {
                return (((gamePage.calcResourcePerTick(a[0]) / gamePage.resPool.get(a[0]).maxValue) * (gamePage.resPool.get(a[0]).value / gamePage.resPool.get(a[0]).maxValue) * (a[2] * gamePage.village.getJob(a[1]).value)) - ((gamePage.calcResourcePerTick(b[0]) / gamePage.resPool.get(b[0]).maxValue) * (gamePage.resPool.get(b[0]).value / gamePage.resPool.get(b[0]).maxValue) * (b[2] * gamePage.village.getJob(b[1]).value)));
             });
	    }
	    else{
	         restmpq = restmp.sort(function(a, b) {
	            if (gamePage.resPool.get(a[0]).value == gamePage.resPool.get(a[0]).maxValue){
	                atick = gamePage.resPool.get(a[0]).maxValue;
	                ajobs = a[3];
	            }
	            else{
	                atick = gamePage.calcResourcePerTick(a[0]);
	                ajobs = gamePage.village.getJob(a[1]).value;
	            }
	            if (gamePage.resPool.get(b[0]).value == gamePage.resPool.get(b[0]).maxValue){
	                btick = gamePage.resPool.get(b[0]).maxValue;
	                bjobs = b[3];
	            }
	            else{
	                btick = gamePage.calcResourcePerTick(b[0]);
	                bjobs = gamePage.village.getJob(b[1]).value;
	            }
	            return (((atick / gamePage.resPool.get(a[0]).maxValue) * (gamePage.resPool.get(a[0]).value / gamePage.resPool.get(a[0]).maxValue) * (a[3] * ajobs) ) * a[3] - ((btick / gamePage.resPool.get(b[0]).maxValue) * (gamePage.resPool.get(b[0]).value / gamePage.resPool.get(b[0]).maxValue) * (b[3] * bjobs)) * b[3]);
             });
	    }

        if (game.village.getFreeKittens() != 0 ) {
            gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]));
        }
        else if (gamePage.village.getKittens() > 0) {
            restmpdel = restmpq.filter(res => gamePage.village.getJob(res[1]).value > 0);
            if (restmpdel.length > 0){
                gamePage.village.sim.removeJob(restmpdel[restmpdel.length - 1][1]);
                gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]));
            }
        }
}

// Control Energy Consumption
function energyControl() {
        if (AutoEnergyControl){
            proVar = gamePage.resPool.energyProd;
            conVar = gamePage.resPool.energyCons;
            FreeEnergy = Math.abs(proVar - conVar);

            var EnergyPriority = [
                [bldSmelter,0.1],
                [bldBioLab,Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))],
                [bldOilWell,Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))],
                [bldFactory,0.1],
                [bldCalciner,0.1],
                [bldAccelerator,0.1],
                [spcContChamber,1],
                 ];

            if (proVar>conVar) {
                EnergyInc = EnergyPriority.filter(res => res[0].val > res[0].on && proVar > (conVar + res[0].effects.energyConsumption)).sort(function(a, b) {
                    return a[1] - b[1];
                });
                if (EnergyInc.length > 0){
                    EnergyInc[0][0].on+= Math.min(Math.floor(FreeEnergy / EnergyInc[0][0].effects.energyConsumption), EnergyInc[0][0].val -  EnergyInc[0][0].on);
                }
            }
            else if (proVar<conVar) {
                EnergyDec = EnergyPriority.filter(res => res[0].on > 0 && res[0].effects.energyConsumption > 0 && proVar < conVar).sort(function(a, b) {
                    return b[1] - a[1];
                });
                if (EnergyDec.length > 0){
                    EnergyDec[0][0].on-= Math.min(Math.ceil(FreeEnergy / EnergyDec[0][0].effects.energyConsumption),EnergyDec[0][0].on);
                }
            }
        }
}

function autoNip() {
		if (gamePage.bld.buildingsData[0].val < 40 && gamePage.resPool.get('catnip').value < 100 ) {
			btn = gamePage.tabs[0].buttons[0]
			try {
				btn.controller.buyItem(btn.model, {}, function(result) {
					if (result) {
                        btn.update();
                        if (gamePage.timer.ticksTotal % 151 === 0){
                            gamePage.msg('Gathering catnip');
                        }
					}
					});
			} catch(err) {
			console.log(err);
			}
		}
		else if ((gamePage.village.getKittens() < 14) && ( gamePage.village.getKittens() == 0 || (gamePage.tabs[0].buttons[2].model.prices[0].val > (gamePage.calcResourcePerTick('catnip') * 500 + gamePage.resPool.get('catnip').value)/2 && gamePage.resPool.get('catnip').value > 100 )) ){
		    btn = gamePage.tabs[0].buttons[1];
		    if (gamePage.timer.ticksTotal % 151 === 0){
                 gamePage.msg('Refine catnip');
            }
            for (var i = 0; i < Math.trunc(gamePage.resPool.get('catnip').value/100); i++) {
                if (btn.model.enabled) {
                     try {
                            btn.controller.buyItem(btn.model, {}, function(result) {
                                    if (result) {
                                        btn.update();
                                    }
                            });
                         } catch(err) {
                            console.log(err);
                         }
                }
            }
		}
}

function UpgradeBuildings() {
            if (gamePage.diplomacy.hasUnlockedRaces()){
                gamePage.diplomacy.unlockRandomRace();
            }
            var mblds = gamePage.bld.meta[0].meta.filter(res => res.stages && res.stages[1].stageUnlocked && res.stage == 0);
            for (var i = 0; i < mblds.length; i++) {
                mblds[i].stage = 1;
                mblds[i].val = 0;
                mblds[i].value = 0;
                mblds[i].on = 0;
            }
            if (gamePage.bld.getBuildingExt('steamworks').meta.on < gamePage.bld.getBuildingExt('steamworks').meta.val && gamePage.resPool.get('coal').value > 0 && gamePage.bld.getBuildingExt('steamworks').meta.unlocked) {
                gamePage.bld.getBuildingExt('steamworks').meta.on = gamePage.bld.getBuildingExt('steamworks').meta.val;
            }
            if (gamePage.bld.getBuildingExt('reactor').meta.on < gamePage.bld.getBuildingExt('reactor').meta.val && gamePage.resPool.get('uranium').value > 0 && gamePage.bld.getBuildingExt('reactor').meta.unlocked) {
                gamePage.bld.getBuildingExt('reactor').meta.on = gamePage.bld.getBuildingExt('reactor').meta.val;
            }
            if (gamePage.bld.getBuildingExt('magneto').meta.on < gamePage.bld.getBuildingExt('magneto').meta.val && gamePage.resPool.get('oil').value > 0 && gamePage.bld.getBuildingExt('magneto').meta.unlocked) {
                gamePage.bld.getBuildingExt('magneto').meta.on = gamePage.bld.getBuildingExt('magneto').meta.val;
            }
            if (gamePage.bld.getBuildingExt('smelter').meta.unlocked){
                if (( gamePage.calcResourcePerTick('wood') + gamePage.getResourcePerTickConvertion('wood') + gamePage.bld.getBuildingExt('smelter').meta.effects.woodPerTickCon +  gamePage.calcResourcePerTick('wood') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on  && ( gamePage.calcResourcePerTick('minerals') + gamePage.getResourcePerTickConvertion('minerals')  + gamePage.bld.getBuildingExt('smelter').meta.effects.mineralsPerTickCon + gamePage.calcResourcePerTick('minerals') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on ) {
                        if  (gamePage.bld.getBuildingExt('smelter').meta.val > gamePage.bld.getBuildingExt('smelter').meta.on){
                            gamePage.bld.getBuildingExt('smelter').meta.on++;
                        }
                }
                else if (gamePage.bld.getBuildingExt('smelter').meta.on > 0) {
                     gamePage.bld.getBuildingExt('smelter').meta.on--;
                }
            }
}

function ResearchSolarRevolution() {
        if (gamePage.religion.getRU('solarRevolution').val == 0){
            if (  gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.metadata.name == "solarRevolution" && res.model.enabled && res.model.resourceIsLimited == false).length > 0){
                    var btn = gamePage.tabs[5].rUpgradeButtons[5];
                            try {
                                btn.controller.buyItem(btn.model, {}, function(result) {
                                    if (result) {
                                        btn.update();
                                        gamePage.msg('Religion researched ' + btn.model.name);
                                    }
                                });
                            } catch(err) {
                                console.log(err);
                            }
            }
	    }
}

function Timepage() {
        if (gamePage.science.get('voidSpace').researched){
            gamePage.timeTab.update();
            var VoidBuild = gamePage.timeTab.vsPanel.children[0].children;
			try {
				for (i = 1 ;i < VoidBuild.length; i++) {
					if (VoidBuild[i].model.metadata.unlocked && VoidBuild[i].model.enabled) {
						VoidBuild[i].controller.buyItem(VoidBuild[i].model, {}, function(result) {
							if (result) {
                                VoidBuild[i].update();
                                gamePage.msg('Build in Time ' + VoidBuild[i].model.name );
							}
							});
					}
				}
			} catch(err) {
			    console.log(err);
			}
	    }
}

function RenderNewTabs(){
    if(gamePage.tabs.filter(tab => tab.tabName != "Stats" && tab.visible && !ActualTabs.includes(tab)).length > 0) {
        gamePage.tabs.filter(tab => tab.tabName != "Stats" && tab.visible && !ActualTabs.includes(tab)).forEach(tab => tab.render());
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats" && tab.visible));

    }
    //space render
    else if(gamePage.tabs[6].GCPanel.children.filter(res => res.model.on == 1).length != gamePage.tabs[6].planetPanels.length){
        gamePage.tabs[6].render();
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats" && tab.visible));
    }
}


// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
gamePage.tabs.filter(tab => tab.tabName != "Stats").forEach(tab => tab.render());
clearInterval(runAllAutomation);
var runAllAutomation = setInterval(function() {

    autoBuild();
    autoNip();

	if (gamePage.timer.ticksTotal % 3 === 0) {
		autoObserve();
        autoCraft2();
		autoHunt();
		autoAssign();
        gamePage.villageTab.updateTab();
	}

	if (gamePage.timer.ticksTotal % 10 === 0) {
		autoSpace();
		energyControl();
	}

	if (gamePage.timer.ticksTotal % 25 === 0) {
		autoResearch();
		autoWorkshop();
		autoParty();
		autoTrade();
		autoPraise();
	}

	if (gamePage.timer.ticksTotal % 151 === 0) {
        RenderNewTabs();
        if (Iinc == 5) {
           autozig();
           UpgradeBuildings();
           ResearchSolarRevolution();
           Timepage();
           Iinc = 0;
        }
	    Iinc++;
	}


}, 200);