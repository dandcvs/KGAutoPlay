// These will allow quick selection of the buildings which consume energy
var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];

var spcContChamber = gamePage.space.meta[5].meta[1];
var spcMoonBase = gamePage.space.meta[2].meta[1];
var spcEntangler = gamePage.space.meta[10].meta[0];

 // These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var FreeEnergy = 0;
var deadScript = "Script is dead";
var Iinc = 0;
var IincKAssign = 0;
var tick = 0

var goldebBuildings = ["temple","tradepost"];
var switches = {"Energy Control":true,"Iron Will":false}
var ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
var f = (a = 1, {x: c} ={ x: a / 10000}) => c;

var upgrades_craft = [
[gamePage.workshop.get("miningDrill"),[["steel",750]]],
[gamePage.workshop.get("oxidation"),[["steel",5000]]],
[gamePage.workshop.get("fluidizedReactors"),[["alloy",200]]],
[gamePage.workshop.get("steelPlants"),[["gear",750]]]
];

game.console.filters = $.extend(true, game.console.filters, {"trade": {
				title: "Trade",
				enabled: true,
				unlocked: false
			}});
gamePage.ui.renderFilters();

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | KGAutoPlay </a>' +

'<div id="optionSelect" style="display:none; margin-top:-130px; margin-left:-30px; width:200px" class="dialog help">' +
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
'<hr size=5>' +
'<button id="autoEnergy" style="color:black" onclick="autoSwitchEnergy(\'Energy Control\',  \'autoEnergy\')"> Energy Control </button></br>' +
'<hr size=3>' +
'<button id="IronWill" style="color:red" onclick="autoSwitchEnergy(\'Iron Will\',  \'IronWill\')"> IronWill </button></br>' +
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
	if (!switches[varCheck]) {
		switches[varCheck] = true;
		gamePage.msg('Auto ' + varCheck + ' is now on');
		document.getElementById(varName).style.color = 'black';
	} else if (switches[varCheck]) {
		switches[varCheck] = false;
		gamePage.msg('Auto ' + varCheck + ' is now off');
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

function getFaithProdCap(){
    var rate = gamePage.religion.getRU("solarRevolution").on ? gamePage.getTriValue(gamePage.religion.faith*2, 1000) : 0;
    var atheismBonus = gamePage.challenges.getChallenge("atheism").researched ? gamePage.religion.getTranscendenceLevel() * 0.1 : 0;
    var blackObeliskBonus = gamePage.religion.getTranscendenceLevel() * gamePage.religion.getTU("blackObelisk").val * 0.005;
    return gamePage.getHyperbolicEffect(rate, Math.min(((gamePage.religion.getTranscendenceLevel()+1) / 100 ) * gamePage.religion.getFaithBonus()*10,950)) * (1 + atheismBonus + blackObeliskBonus);
}


//Auto praise the sun
function autoPraise(){
	if (gamePage.religionTab.visible) {
	    gamePage.tabs[5].update();
	    if (gamePage.religion.meta[1].meta[5].val == 1) {

            if (gamePage.religion.getProductionBonus() <= getFaithProdCap()){
                gamePage.religion.praise();
            }
            else if (gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)')))).length > 0){
                var btn = gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))));
                for (var i = 0; i < btn.length; i++) {
                    if (btn[i].model.enabled && btn[i].model.visible) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Religion researched: ' + btn[i].model.name);
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
            else if ( gamePage.religion.getRU("apocripha").on && (gamePage.religion.faith / gamePage.religion.getFaithBonus()) >  gamePage.resPool.get("faith").maxValue * 10){
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
                var btn = gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))));
                for (var i = 0; i < btn.length; i++) {
                    if (btn[i].model.enabled && btn[i].model.visible) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Religion researched: ' + btn[i].model.name);
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


        if (gamePage.science.get("cryptotheology").researched){
            var btn = gamePage.tabs[5].ctPanel.children[0].children;
                for (var i = 0; i < btn.length; i++) {
                    if (btn[i].model.enabled && btn[i].model.visible) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Religion Cryptotheology researched: ' + btn[i].model.name);
                                }
                                });
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
        }
	}
}

// Build buildings automatically
function autoBuild() {
        var btn = gamePage.tabs[0].buttons.filter(res =>  res.model.metadata && res.model.metadata.unlocked);
        for (i = 0 ;i < btn.length; i++) {
             btn[i].controller.updateEnabled(btn[i].model);
             if  (btn[i].model.enabled){
                 if ((goldebBuildings.includes(btn[i].model.metadata.name) && !gamePage.ironWill) || (gamePage.ironWill && gamePage.bld.buildingsData[27].val > 3 && goldebBuildings.includes(btn[i].model.metadata.name))){
                       if ((gamePage.religion.getRU('solarRevolution').val == 1) || (btn[i].model.metadata.name == 'temple' &&  btn[i].model.metadata.val < 3) || (btn[i].model.prices.filter(res => res.name == 'gold')[0].val < (gamePage.resPool.get('gold').value - 500)) || (gamePage.resPool.get('gold').value == gamePage.resPool.get('gold').maxValue) ) {
                                  try {
                                        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                        if (result) {
                                            btn[i].update();
                                            gamePage.msg('Build: ' + btn[i].model.name );
                                            return;
                                        }
                                        });
                                  } catch(err) {
                                    console.log(err);
                                  }
                             }
                 }
                 else if (btn[i].model.metadata.name == "aiCore"){
                     if (spcEntangler.val/5 > btn[i].model.metadata.val){
                        try {
                                btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Build: ' + btn[i].model.name );
                                    return;
                                }
                                });
                         } catch(err) {
                             console.log(err);
                         }
                     }
                 }
                 else if (gamePage.ironWill){
                       if (!btn[i].model.metadata.effects.maxKittens)
                      {
                            if ((!gamePage.workshop.get("goldOre").researched && btn[i].model.prices.filter(res => res.name == 'science').length > 0) ||
                                (!gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked && btn[i].model.prices.filter(res => res.name == 'minerals').length > 0) ||
                                ((gamePage.bld.buildingsData[27].unlocked && gamePage.bld.buildingsData[27].val <= 5 && gamePage.bld.buildingsData[27].name != btn[i].model.metadata.name) && btn[i].model.prices.filter(res => res.name == 'minerals').length > 0) ||
                                (((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked)||(!gamePage.science.get('philosophy').researched && gamePage.science.get('philosophy').unlocked)||(!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked)) && btn[i].model.prices.filter(res => res.name == 'science').length > 0 && btn[i].model.prices.filter(res => res.name == 'science')[0].val > 1000)
                            )
                            {}
                            else{
                                try {
                                        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                        if (result) {
                                            btn[i].update();
                                            gamePage.msg('Build: ' + btn[i].model.name );
                                            return;
                                        }
                                        });
                                 } catch(err) {
                                     console.log(err);
                                 }
                             }
                     }
                 }
                 else {
                         try {
                                btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Build: ' + btn[i].model.name );
                                    return;
                                }
                                });
                         } catch(err) {
                             console.log(err);
                         }
                 }
             }
        }
}

// Build space stuff automatically
function autoSpace() {
    if (gamePage.spaceTab.visible) {
        gamePage.tabs[6].update();
        // Build space buildings
        for (var z = 0; z < gamePage.tabs[6].planetPanels.length; z++) {
                var spBuild = gamePage.tabs[6].planetPanels[z].children;
                try {
                    for (i = 0 ;i < spBuild.length; i++) {
                        if (spBuild[i].model.metadata.unlocked) {
                            if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && spBuild[i].model.prices.filter(res => res.name == 'antimatter').length > 0){
                                {}
                            }
                            else if (gamePage.ironWill){
                                if(!spBuild[i].model.metadata.effects.maxKittens){
                                    spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
                                    if (result) {
                                        spBuild[i].update();
                                        gamePage.msg('Build in Space: ' + spBuild[i].model.name);
                                        return;
                                    }
                                    });
                                }
                            }else{
                                spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
                                if (result) {
                                    spBuild[i].update();
                                    gamePage.msg('Build in Space: ' + spBuild[i].model.name);
                                    return;
                                }
                                });
                            }
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
                            gamePage.msg('Research Space program: ' + spcProg[i].model.name );
                            return;
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
        if  (gamePage.resPool.get('titanium').value > 5000 && gamePage.resPool.get('uranium').value <  Math.min(gamePage.resPool.get('paragon').value,100) && gamePage.diplomacy.get('dragons').unlocked && gamePage.resPool.get('gold').value < gamePage.resPool.get('gold').maxValue * 0.95) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), 1);
        }
        if ((gamePage.resPool.get('titanium').value < gamePage.resPool.get('paragon').value < 1000 ? gamePage.resPool.get('paragon').value : 200000 || gamePage.resPool.get('blueprint').value < 100) && gamePage.diplomacy.get('zebras').unlocked && gamePage.resPool.get('gold').value < gamePage.resPool.get('gold').maxValue * 0.95) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"), 1);
        }
        if((gamePage.religion.getRU('solarRevolution').val == 1 || (gamePage.resPool.get('gold').value == gamePage.resPool.get('gold').maxValue && gamePage.resPool.get('gold').maxValue < 500)) || (gamePage.ironWill)){
            let titRes = gamePage.resPool.get('titanium');
            let ironRes = gamePage.resPool.get('iron');
            let unoRes = gamePage.resPool.get('unobtainium');
            let woodRes = gamePage.resPool.get('wood');
            let mineralsRes = gamePage.resPool.get('minerals');
            let goldResource = gamePage.resPool.get('gold');
            let ivoryRes = gamePage.resPool.get('ivory');
            let slabRes = gamePage.resPool.get('slab');
            let uranRes = gamePage.resPool.get('uranium');
            let scaffoldRes = gamePage.resPool.get('scaffold');
            let coalRes = gamePage.resPool.get('coal');
            if ((goldResource.value > goldResource.maxValue * 0.95) || (gamePage.ironWill && goldResource.value > 600 )) {
                if (gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
                    if (unoRes.value > unoRes.maxValue * 0.95){
                        gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
                    }else if(unoRes.value > 5000 && (gamePage.timer.ticksTotal % 650 === 0 || (unoRes.value > Math.min((gamePage.resPool.get("timeCrystal").value-25)*10000, (gamePage.resPool.get("relic").value-5)*10000*25 )))) {
                        gamePage.diplomacy.tradeMultiple(game.diplomacy.get("leviathans"),Math.max(Math.floor(unoRes.value/200000),1));
                    }
                    //Feed elders
                    if (gamePage.resPool.get("necrocorn").value >= 1 && gamePage.diplomacy.get("leviathans").energy < gamePage.religion.getZU("marker").val * 5 + 5){
                        gamePage.diplomacy.feedElders();
                    }
                }

                let tradersAll = [
                ['zebras',titRes,slabRes,0.9,50],
                gamePage.ironWill ? ['griffins',ironRes,woodRes,0.5,500] : ['zebras',ironRes,slabRes,0.9,50],
                ['nagas',mineralsRes,ivoryRes,0.9,500],
                ['spiders',coalRes,scaffoldRes,0.9,50],
                ['dragons',uranRes,titRes,0.9,250]
                ]

                let trade = tradersAll.filter(tr => gamePage.diplomacy.get(tr[0]).unlocked && tr[1].value < tr[1].maxValue * tr[3] && tr[2].value > tr[1].value && tr[2].value > tr[4]).sort(function(a, b) {return  a[1].value / a[1].maxValue - b[1].value / b[1].maxValue;})[0]
                if (trade) {
                    if (gamePage.ironWill) {
                        if (trade[0] == 'griffins' && trade[2].value > trade[2].maxValue * 0.8 ) {
                            gamePage.diplomacy.tradeMultiple(game.diplomacy.get(trade[0]),Math.ceil(gamePage.diplomacy.getMaxTradeAmt(game.diplomacy.get(trade[0])) / 10));
                        }
                        else {
                            gamePage.diplomacy.tradeAll(game.diplomacy.get(trade[0]));
                        }
                    }
                    else {
                        gamePage.diplomacy.tradeAll(game.diplomacy.get(trade[0]));
                    }
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



function autoCraft2() {

        if (gamePage.science.get("construction").researched && gamePage.tabs[3].visible ) {
            // [name,resurces,countlimit,paragonBool,craftableBool]
            let  resourcesAll = [
                ["beam", [["wood",175]],Math.min(gamePage.resPool.get("wood").value/175*gamePage.getCraftRatio()+1,50000),true, true],
                ["slab", [["minerals",250]], Math.min(gamePage.resPool.get("minerals").value/250*gamePage.getCraftRatio()+1,50000),true, true],
                ["steel", [["iron",100],["coal",100]],Math.min(gamePage.resPool.get("iron").value/100*gamePage.getCraftRatio()+1,gamePage.resPool.get("coal").value/100*gamePage.getCraftRatio()+1,50000),true, true],
                ["plate", [["iron",125]],gamePage.ironWill ? 15 :gamePage.resPool.get("plate").value < 150 ? 150 : Math.min(gamePage.resPool.get("iron").value/125*gamePage.getCraftRatio()+1,50000),true, true],
                ["concrate", [["steel",25],["slab",2500]],0,true, true],
                ["gear", [["steel",15]],25,true, true],
                ["alloy", [["steel",75],["titanium",10]],Math.min(Math.max(Math.min(gamePage.resPool.get("steel").value/75*gamePage.getCraftRatio()+1,gamePage.resPool.get("titanium").value/10*gamePage.getCraftRatio()+1),50),1000),true, true],
                ["eludium", [["unobtainium",1000],["alloy",2500]],gamePage.resPool.get("eludium").value < 125 ? 125 : Math.min(gamePage.resPool.get("unobtainium").value/1000*gamePage.getCraftRatio()+1,50000),true, true],
                ["scaffold", [["beam",50]],0,true, true],
                ["ship", [["scaffold",100],["plate",150],["starchart",gamePage.resPool.get("ship").value < 100 ? 25 : gamePage.workshop.get("geodesy").researched ? 25 : 100500]],100,true, true],
                ["tanker", [["ship",200],["kerosene",gamePage.resPool.get('oil').maxValue * 2],["alloy",1250],["blueprint",5]],0,true, true],
                ["kerosene", [["oil",7500]],Math.min(gamePage.resPool.get("oil").value/7500*gamePage.getCraftRatio()+1,50000),true, true],
                ["parchment", [["furs",175]],0,true, true],
                ["manuscript", [["parchment",25],["culture",400]],gamePage.ironWill ? gamePage.resPool.get('culture').value > 1600 ? 50 : 0 : 110,true, true],
                ["compedium", [["manuscript",50],["science",10000]],gamePage.ironWill ? gamePage.science.get('astronomy').researched ?  Math.min(gamePage.resPool.get("science").value/10000*gamePage.getCraftRatio()+1,500): 0 : 110,true, true],
                ["blueprint", [["compedium",25],["science",25000]],0,true, true],
                ["thorium", [["uranium",250]],Math.min(gamePage.resPool.get("uranium").value/250*gamePage.getCraftRatio()+1,50000),true, true],
                ["megalith", [["slab",50],["beam",25],["plate",5]],0,true, true]
            ]
            var flag = true;
            var cnt = 0;
            let resourcesAll_Fix = [];

            for (var i = 0; i < upgrades_craft.length; i++)  {
                if (upgrades_craft[i][0].researched ) {
                    upgrades_craft.splice(i,1);
                    break;
                }
                if (upgrades_craft[i][0].unlocked ){
                    for (var j = 0; j < upgrades_craft[i][1].length; j++) {
                        for (var g = 0; g < resourcesAll.length; g++) {
                            if (resourcesAll[g][0] == upgrades_craft[i][1][j][0]) {
                                resourcesAll[g][2] =  upgrades_craft[i][1][j][1]
                                resourcesAll[g][3] =  false
                                resourcesAll[g][4] =  true
                            }
                        }
                        let respack = resourcesAll.filter(res => res[0] == upgrades_craft[i][1][j][0])[0][1]
                        let reslist = []
                        for (var g = 0; g < respack.length; g++) {
                            reslist[reslist.length] = respack[g][0]
                        }

                        for (var g = 0; g < resourcesAll.length; g++) {
                             for (var b = 0; b < resourcesAll[g][1].length; b++) {
                                if ( resourcesAll[g][0] != upgrades_craft[i][1][j][0] && reslist.indexOf(resourcesAll[g][1][b][0]) > 0 || resourcesAll[g][1][b][0] == upgrades_craft[i][1][j][0]) {
                                    resourcesAll[g][4] =  false
                                }
                             }
                        }
                    }
                    break;
                }
            }


            var resourcesAllF = resourcesAll.filter(res => res[4] && gamePage.workshop.getCraft(res[0]).unlocked && (resourcesAll.filter(res2 => res2[0] == res[1][0][0]).length == 0 ||  gamePage.resPool.get(res[1][0][0]).value > Math.max(res[1][0][1],Math.min(resourcesAll.filter(res2 => res2[0] == res[1][0][0])[0][2], !res[3] ? resourcesAll.filter(res2 => res2[0] == res[1][0][0])[0][2] : gamePage.resPool.get('paragon').value)) )).sort(function(a, b) {
            return (gamePage.resPool.get(a[0]).value - gamePage.resPool.get(b[0]).value);
            });



            for (var i = 0; i < resourcesAllF.length; i++) {
                var curResTarget = gamePage.resPool.get(resourcesAllF[i][0]);
                if (gamePage.workshop.getCraft(resourcesAllF[i][0]).unlocked && resourcesAllF[i][4]) {
                     flag = true;
                     cnt = 0;
                     if (curResTarget.value <= Math.min(resourcesAllF[i][2] , !resourcesAllF[i][3] ? resourcesAllF[i][2] : gamePage.resPool.get('paragon').value)) {
                        if (gamePage.resPool.get(resourcesAllF[i][1][0][0]).value >= resourcesAllF[i][1][0][1]) {
                             for (var x = 0; x < resourcesAllF[i][1].length; x++) {
                                cnt = Math.min(cnt != 0 ? cnt : Math.ceil((gamePage.resPool.get(resourcesAllF[i][1][x][0]).value / resourcesAllF[i][1][x][1])/2),Math.ceil((gamePage.resPool.get(resourcesAllF[i][1][x][0]).value / resourcesAllF[i][1][x][1])/2), Math.ceil(Math.min(resourcesAllF[i][2] , !resourcesAllF[i][3] ? resourcesAllF[i][2] : gamePage.resPool.get('paragon').value) - curResTarget.value) + 1 );
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
                                else if (tmpvalueMax != 0 && ((curResTarget.value < tmpvalue && tmpvalue/tmpvalueMax < 0.3) || (curResTarget.value >= tmpvalue && tmpvalue/tmpvalueMax < 0.99))) {
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
    if (gamePage.tabs[2].visible) {
        gamePage.tabs[2].update();
        var btn = gamePage.tabs[2].buttons.filter(res => res.model.metadata.unlocked && res.model.enabled);
        for (var i = 0; i < btn.length; i++) {
            if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
                if ((gamePage.ironWill && !['astronomy','theology'].includes(btn[i].model.metadata.name)) && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked ) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked)))
                   {}
                else{
                    try {
                        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                            if (result) {
                                btn[i].update();
                                gamePage.msg('Researched: ' + btn[i].model.name );
                                return;
                            }
                        });
                    } catch(err) {
                    console.log(err);
                    }
                }
                }
        }
    }
}

// Auto Workshop upgrade
function autoWorkshop() {
    if (gamePage.workshopTab.visible) {
        gamePage.tabs[3].update();
         var btn = gamePage.tabs[3].buttons.filter(res => res.model.metadata.unlocked);
         for (var i = 0; i < btn.length; i++) {
            if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
                if (gamePage.ironWill && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked  && gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked)))
                {}
                else{
                    try {
                        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                            if (result) {
                                btn[i].update();
                                gamePage.msg('Upgraded: ' + btn[i].model.name );
                                return;
                            }
                        });
                    } catch(err) {
                    console.log(err);
                    }
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
		var tclvl = Math.max(gamePage.religion.tclevel,1);

		if (catpower > 1500 && culture > 5000 && parchment > 2500) {
			if (gamePage.calendar.festivalDays < 400*30) {
			    if(catpower > 1500 * tclvl && culture > 5000 * tclvl && parchment > 2500 * tclvl){
			        gamePage.village.holdFestival(tclvl);
			    }
			    else{
				    gamePage.village.holdFestival(1);
				}
			}
		}
	}
}

function autozig() {
    if (gamePage.religionTab.visible) {
        if (gamePage.bld.getBuildingExt('ziggurat').meta.on > 0 && !gamePage.religionTab.sacrificeBtn) {
             gamePage.tabs[5].render();
        }
        gamePage.religionTab.update();


        if (gamePage.religionTab.sacrificeBtn && gamePage.resPool.get('unicorns').value > gamePage.resPool.get('tears').value ){
            var btn = gamePage.tabs[0].buttons.filter(res =>  res.model.metadata && res.model.metadata.unlocked && res.model.metadata.name == 'unicornPasture');

            if (btn.length > 0 &&  ((btn[0].model.prices[0].val - gamePage.resPool.get('unicorns').value) / (gamePage.getResourcePerTick('unicorns', true) * gamePage.getRateUI()))/60 > 5){
                if(gamePage.religionTab.sacrificeBtn.model.allLink.visible){
                    gamePage.religionTab.sacrificeBtn.model.allLink.handler(gamePage.religionTab.sacrificeBtn.model,function(result){
                     if (result) {
                         gamePage.religionTab.sacrificeBtn.update();
                     }
                    });
                }
            }
        }

        if (gamePage.resPool.get('alicorn').value > 25 && gamePage.resPool.get('alicorn').value > gamePage.resPool.get("timeCrystal").value) {
            if (gamePage.religionTab.sacrificeAlicornsBtn.model.allLink.visible){
                gamePage.religionTab.sacrificeAlicornsBtn.model.allLink.handler(gamePage.religionTab.sacrificeAlicornsBtn.model,function(result){
                 if (result) {
                     gamePage.religionTab.sacrificeAlicornsBtn.update();
                 }
                });
            }
        }
        if (gamePage.resPool.get('timeCrystal').value > 50 && gamePage.resPool.get('timeCrystal').value / Math.max(gamePage.resPool.get("relic").value,1) > 3 && gamePage.resPool.get("relic").value > 100) {
            if (gamePage.religionTab.refineTCBtn.model.allLink.visible){
                gamePage.religionTab.refineTCBtn.model.allLink.handler(gamePage.religionTab.refineTCBtn.model,function(result){
                    if (result) {
                        gamePage.religionTab.refineTCBtn.update();
                    }
                });
            }
        }


        if(gamePage.religionTab.zgUpgradeButtons.filter(res => res.model.metadata.unlocked).length > 0){
            zig = gamePage.religionTab.zgUpgradeButtons.filter(res => res.model.visible).sort(function(a, b) {
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

             for (var i = 0; i < btn.length; i++) {
                btn[i].controller.updateEnabled(btn[i].model);
             }

            if (btn.length < 2 || (btn.slice(btn.length - 2, btn.length ).filter(res => res.model.enabled).length > 0) || (gamePage.religionTab.zgUpgradeButtons[0].model.prices[1].val < gamePage.resPool.get('tears').value * 0.1) || (gamePage.religionTab.zgUpgradeButtons[6].model.prices[1].val < gamePage.resPool.get('tears').value * 0.1 && gamePage.religionTab.zgUpgradeButtons[6].model.prices[2].val < gamePage.resPool.get('unobtainium').value) ) {
                for (var i = btn.length - 1; i >= 0; i--) {
                    if (btn[i] && btn[i].model.metadata.unlocked ) {
                        try {
                            btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                                if (result) {
                                    btn[i].update();
                                    gamePage.msg('Build in Ziggurats: ' + btn[i].model.name );
                                    }
                                });
                        } catch(err) {
                        console.log(err);
                        }
                    }
                }
            }
        }

        if ( gamePage.resPool.get('sorrow').value < gamePage.resPool.get('sorrow').maxValue &&  gamePage.resPool.get('sorrow').value * 10000 < gamePage.resPool.get('tears').value ){
            var btn = [gamePage.religionTab.refineBtn]
            for (var i = 0; i < btn.length; i++) {
                if (btn[i] && btn[i].model.visible == true) {
                    try {
                         btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                            if (result) {
                                gamePage.msg('Refine tears: BLS(' + Math.trunc(gamePage.resPool.get('sorrow').value)  + ')');
                            }
                            });
                    } catch(err) {
                    console.log(err);
                    }
                }
            }
        }
    }
}

// Auto assign new kittens to selected job
function autoAssign() {
        var resourcesAssign = [
       		["catnip", "farmer",gamePage.resPool.get("beam").value > gamePage.resPool.get("catnip").maxValue ? gamePage.resPool.get("beam").value / gamePage.resPool.get("catnip").maxValue + 9 :9,1],
            ["wood", "woodcutter",(gamePage.resPool.get("beam").value < gamePage.resPool.get("slab").value && gamePage.resPool.get("beam").value < gamePage.resPool.get("wood").value) ? gamePage.resPool.get("wood").value/gamePage.resPool.get("wood").maxValue : gamePage.resPool.get("beam").value > gamePage.resPool.get("wood").maxValue ? gamePage.resPool.get("beam").value/gamePage.resPool.get("wood").maxValue : 1 , 2],
        	["minerals", "miner",(gamePage.resPool.get("slab").value < gamePage.resPool.get("beam").value && gamePage.resPool.get("slab").value < gamePage.resPool.get("minerals").value) ? gamePage.resPool.get("minerals").value/gamePage.resPool.get("minerals").maxValue :  gamePage.resPool.get("slab").value > gamePage.resPool.get("minerals").maxValue ? gamePage.resPool.get("slab").value/gamePage.resPool.get("minerals").maxValue : 1 ,2],
            ["science", "scholar",(gamePage.resPool.get("science").value < gamePage.resPool.get("science").maxValue * 0.5) ? 0.5 : 1,1],
        	["manpower", "hunter",(gamePage.science.get('theology').researched && gamePage.resPool.get("compedium").value < 110 && gamePage.resPool.get("manuscript").value < 110) ? 0.1 : 1 ,5],
            ["faith", "priest",gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))) && (!(res.model.name.includes('(Transcend)')))).length  == 0 ? 50+gamePage.religion.tclevel : gamePage.resPool.get("faith").value/gamePage.resPool.get("faith").maxValue * 10 + 1 ,5],
            (gamePage.resPool.get("coal").value / gamePage.resPool.get("coal").maxValue  || 100) < (gamePage.workshop.get("geodesy").researched ? gamePage.resPool.get("gold").value / gamePage.resPool.get("gold").maxValue : 100) ? ["coal", "geologist",gamePage.resPool.get("coal").value < gamePage.resPool.get("coal").maxValue * 0.99 ? 1 : 15,15] : ["gold", "geologist",gamePage.resPool.get("gold").value < gamePage.resPool.get("gold").maxValue * 0.99 ? 1 : 15,15]
                ];

        let hutBtn = gamePage.tabs[0].buttons.filter(res => res.model.metadata && res.model.metadata.name == "hut")[0];
        let logHtBtn = gamePage.tabs[0].buttons.filter(res => res.model.metadata && res.model.metadata.name == "logHouse")[0];

        if (logHtBtn && (logHtBtn.model.prices[0].val < gamePage.resPool.get('wood').maxValue * 0.3 || logHtBtn.model.prices[1].val < gamePage.resPool.get('minerals').maxValue * 0.3)){
            if (gamePage.resPool.get('wood').value < logHtBtn.model.prices[0].val){
                resourcesAssign[1] = ["wood", "woodcutter",0.1,0.1]
            }
            if ( gamePage.resPool.get('minerals').value < logHtBtn.model.prices[1].val){
                resourcesAssign[2] = ["minerals", "miner",0.1,0.1]
            }
        }
        else if (hutBtn && hutBtn.model.prices[0].val < gamePage.resPool.get('wood').maxValue * 0.3){
            resourcesAssign[1] = ["wood", "woodcutter",0.1,0.1]
        }

	    let restmp = resourcesAssign.filter(res => res[0] in gamePage.village.getJob(res[1]).modifiers &&  gamePage.village.getJob(res[1]).unlocked);
	    restmpq = restmp.sort(function(a, b) {
	            if (gamePage.resPool.get(a[0]).value >= gamePage.resPool.get(a[0]).maxValue){
	                atick = gamePage.resPool.get(a[0]).maxValue * 10;
	                ajobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.currentChallenge == 'atheism') ? a[2] : a[3];
	            }
	            else{
	                atick = gamePage.calcResourcePerTick(a[0]);
	                ajobs = gamePage.village.getJob(a[1]).value;
	            }
	            if (gamePage.resPool.get(b[0]).value >= gamePage.resPool.get(b[0]).maxValue){
	                btick = gamePage.resPool.get(b[0]).maxValue * 10;
	                bjobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.currentChallenge == 'atheism') ? b[2] : b[3];
	            }
	            else{
	                btick = gamePage.calcResourcePerTick(b[0]);
	                bjobs = gamePage.village.getJob(b[1]).value;
	            }
	            kfa = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.currentChallenge == 'atheism') ? a[2] : a[3];
	            kfb = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.currentChallenge == 'atheism') ? b[2] : b[3];
	            return (((atick / gamePage.resPool.get(a[0]).maxValue) * (gamePage.resPool.get(a[0]).value / gamePage.resPool.get(a[0]).maxValue) * (kfa * ajobs) ) * kfa - ((btick / gamePage.resPool.get(b[0]).maxValue) * (gamePage.resPool.get(b[0]).value / gamePage.resPool.get(b[0]).maxValue) * (kfb * bjobs)) * kfb);

        });

        if (game.village.getFreeKittens() != 0 ) {
            gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),1);
        }
        else if (gamePage.village.getKittens() > 0) {
            restmpdel = restmpq.filter(res => gamePage.village.getJob(res[1]).value > 1);
            if (restmpdel.length > 0){
                let cnt = gamePage.resPool.get(restmpdel[restmpdel.length - 1][0]).value >= gamePage.resPool.get(restmpdel[restmpdel.length - 1][0]).maxValue ? gamePage.village.getJob(restmpdel[restmpdel.length - 1][1]).value -1 : Math.max(Math.floor(gamePage.village.getJob(restmpdel[restmpdel.length - 1][1]).value * 0.1),1)

                gamePage.village.sim.removeJob(restmpdel[restmpdel.length - 1][1],cnt);
                gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),cnt);
            }
        }
        if (gamePage.science.get('civil').researched && !gamePage.ironWill){
            if (IincKAssign > 100) {
                  let prkitten = gamePage.village.sim.kittens.filter(kitten => kitten.job == restmpq[0][1]).sort(function(a, b) {return  b.skills[restmpq[0][1]] - a.skills[restmpq[0][1]];})[0]
                  if (prkitten){
                      gamePage.villageTab.censusPanel.census.makeLeader(prkitten);
                      if (gamePage.village.sim.expToPromote(prkitten.rank, prkitten.rank+1, prkitten.exp)[0]) {
                         gamePage.village.sim.promote(prkitten);
                      }
                  }
                  IincKAssign = 0;
            }
            IincKAssign++;
        }
}

// Control Energy Consumption
function energyControl() {
        if (switches["Energy Control"]){
            proVar = gamePage.resPool.energyProd;
            conVar = gamePage.resPool.energyCons;
            FreeEnergy = Math.abs(proVar - conVar);

            var EnergyPriority = [
                [bldSmelter,0.1],
                [bldBioLab,Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))* (gamePage.space.meta[3].meta[1].val +1)],
                [bldOilWell,Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))* (gamePage.space.meta[3].meta[1].val +1)],
                [bldFactory,0.1],
                (gamePage.ironWill && Math.floor(gamePage.resPool.get('minerals').value / 1000) < gamePage.bld.getBuildingExt('calciner').meta.val ) ? [bldSmelter,0.1] : [bldCalciner,0.101],
                [bldAccelerator,0.1],
                [spcContChamber,gamePage.science.get('antimatter').researched ? gamePage.resPool.get("antimatter").maxValue/gamePage.resPool.get("antimatter").value : 9999],
                [spcMoonBase,0.3]
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
		if (gamePage.bld.buildingsData[0].val < 40 && gamePage.resPool.get('catnip').value < 100 && (gamePage.gatherClicks  < 2500 || gamePage.ironWill )) {
		    btn = gamePage.tabs[0].buttons[0];
			try {
				btn.controller.buyItem(btn.model, {}, function(result) {
					if (result) {
                        if (gamePage.timer.ticksTotal % 151 === 0){
                            gamePage.msg('Gathering catnip');
                        }
					}
					});
			} catch(err) {
			console.log(err);
			}
		}
}
function autoRefine() {
    if ( ((gamePage.village.getKittens() < 14) && ( gamePage.village.getKittens() == 0 || (gamePage.tabs[0].buttons[2].model.prices[0].val > (gamePage.calcResourcePerTick('catnip') * 500 + gamePage.resPool.get('catnip').value)/2 && gamePage.resPool.get('catnip').value > 100 )))) {
        if (!gamePage.workshopTab.visible ){
                    btn = gamePage.tabs[0].buttons[1];
                    price = gamePage.tabs[0].buttons[1].model.prices[0].val;
                    limit = Math.min(gamePage.resPool.get('wood').maxValue * 0.1 - gamePage.resPool.get('wood').value,Math.trunc(gamePage.resPool.get('catnip').value/price));
                    if (gamePage.timer.ticksTotal % 151 === 0){
                         gamePage.msg('Refine catnip');
                    }

                    for (var i = 0; i < limit; i++) {
                        if (btn.model.enabled) {
                             try {
                                    btn.controller.buyItem(btn.model, {}, function(result) {
                                            if (result) {
                                            }
                                    });
                                 } catch(err) {
                                    console.log(err);
                                 }
                        }
                    }
        }
        else if(gamePage.tabs[0].buttons[1].model.x100Link && gamePage.ironWill && gamePage.resPool.get('wood').value < gamePage.resPool.get('wood').maxValue * 0.1) {
            if (gamePage.tabs[0].buttons[1].model.x100Link.visible){
                gamePage.tabs[0].buttons[1].model.x100Link.handler(gamePage.tabs[0].buttons[1].model);
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
        if (((gamePage.ironWill && gamePage.diplomacy.get('nagas').unlocked && gamePage.resPool.get('gold').unlocked &&  gamePage.resPool.get('minerals').value / 100 > gamePage.bld.getBuildingExt('smelter').meta.on ) || (gamePage.ironWill && ((gamePage.workshop.get("goldOre").researched && gamePage.bld.getBuildingExt('amphitheatre').meta.val > 3) || gamePage.resPool.get('iron').value < 100 ))) || ((gamePage.calcResourcePerTick('wood') + gamePage.getResourcePerTickConvertion('wood') + gamePage.bld.getBuildingExt('smelter').meta.effects.woodPerTickCon +  gamePage.calcResourcePerTick('wood') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on  && ( gamePage.calcResourcePerTick('minerals') + gamePage.getResourcePerTickConvertion('minerals')  + gamePage.bld.getBuildingExt('smelter').meta.effects.mineralsPerTickCon + gamePage.calcResourcePerTick('minerals') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on)) {
                if (gamePage.ironWill) {
                    if (gamePage.bld.getBuildingExt('smelter').meta.val >= gamePage.bld.getBuildingExt('smelter').meta.on){
                        gamePage.bld.getBuildingExt('smelter').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 100), gamePage.bld.getBuildingExt('smelter').meta.val);
                        gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
                    }
                }
                else if (gamePage.bld.getBuildingExt('smelter').meta.val > gamePage.bld.getBuildingExt('smelter').meta.on){
                    gamePage.bld.getBuildingExt('smelter').meta.on++;
                }
        }
        else if (gamePage.bld.getBuildingExt('smelter').meta.on > 0) {
            if (gamePage.ironWill) {
                if (gamePage.bld.getBuildingExt('amphitheatre').meta.val > 3){
                    gamePage.bld.getBuildingExt('smelter').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 100), gamePage.bld.getBuildingExt('smelter').meta.on--);
                    gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
                }
                else {
                    gamePage.bld.getBuildingExt('smelter').meta.on= 0;
                }
            }
            else{
                gamePage.bld.getBuildingExt('smelter').meta.on--;
            }
        }
    }
}

function ResearchSolarRevolution() {
        if (gamePage.religion.getRU('solarRevolution').val == 0){
            if (  gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.metadata.name == "solarRevolution" && res.model.visible &&  res.model.enabled && res.model.resourceIsLimited == false).length > 0){
                    var btn = gamePage.tabs[5].rUpgradeButtons[5];
                            try {
                                btn.controller.buyItem(btn.model, {}, function(result) {
                                    if (result) {
                                        btn.update();
                                        gamePage.msg('Religion researched: ' + btn.model.name);
                                    }
                                });
                            } catch(err) {
                                console.log(err);
                            }
            }
	    }
}

function Timepage() {
        if (gamePage.science.get('voidSpace').researched || gamePage.workshop.get("chronoforge").researched ){
            gamePage.timeTab.update();
        }
        if (gamePage.science.get('voidSpace').researched){
            var VoidBuild = gamePage.timeTab.vsPanel.children[0].children;
			try {
				for (i = 1 ;i < VoidBuild.length; i++) {
					if (VoidBuild[i].model.metadata.unlocked && VoidBuild[i].model.enabled) {
					    if (i != 3 && VoidBuild[3].model.enabled && VoidBuild[3].model.metadata.val < 5){
                            {}
                        }
					    else if (gamePage.ironWill){
					        if(!VoidBuild[i].model.metadata.effects.maxKittens){
                                VoidBuild[i].controller.buyItem(VoidBuild[i].model, {}, function(result) {
                                if (result) {
                                    VoidBuild[i].update();
                                    gamePage.msg('Build in Time: ' + VoidBuild[i].model.name );
                                }
                                });
							}
						}else{
                            VoidBuild[i].controller.buyItem(VoidBuild[i].model, {}, function(result) {
                            if (result) {
                                VoidBuild[i].update();
                                gamePage.msg('Build in Time: ' + VoidBuild[i].model.name );
                            }
                            });
						}
					}
				}
			} catch(err) {
			    console.log(err);
			}

	    }
        if (gamePage.workshop.get("chronoforge").researched){
            var chronoforge = gamePage.timeTab.cfPanel.children[0].children;
            if (gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0 && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue && ((gamePage.calendar.cycle != 5 || (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && gamePage.resPool.get("unobtainium").value > gamePage.resPool.get("unobtainium").maxValue * 0.1)) || gamePage.resPool.get("unobtainium").value > gamePage.resPool.get("unobtainium").maxValue * 0.8 )) {
                var factor = gamePage.challenges.getChallenge("1000Years").researched ? 5 : 10
                if (chronoforge[0].model.x100Link.visible && gamePage.getEffect("heatMax") - gamePage.time.heat > factor * 100 && gamePage.resPool.get("timeCrystal").value > chronoforge[0].model.prices[0].val*100){
                    chronoforge[0].model.x100Link.handler(chronoforge[0].model);
                    chronoforge[0].update();
                }
                else if (chronoforge[0].model.x5Link.visible && gamePage.getEffect("heatMax") - gamePage.time.heat > factor*5 && gamePage.resPool.get("timeCrystal").value > chronoforge[0].model.prices[0].val*5){
                    chronoforge[0].model.x5Link.handler(chronoforge[0].model);
                    chronoforge[0].update();
                }
                else if (gamePage.getEffect("heatMax") - gamePage.time.heat > factor && gamePage.resPool.get("timeCrystal").value > chronoforge[0].model.prices[0].val) {
                        try {
                               chronoforge[0].controller.buyItem(chronoforge[0].model, {}, function(result) {
                                if (result) {
                                    chronoforge[0].update();
                                }
                                });
                        } catch(err) {
                            console.log(err);
                        }
                }
            }
            try {
                for (i = 1 ;i < chronoforge.length; i++) {
                    if (chronoforge[i].model.metadata.unlocked && chronoforge[i].model.enabled) {
                        chronoforge[i].controller.buyItem(chronoforge[i].model, {}, function(result) {
                            if (result) {
                                chronoforge[i].update();
                                gamePage.msg('Build in Time: ' + chronoforge[i].model.name );
                            }
                            });
                    }
                }
            } catch(err) {
                console.log(err);
            }
        }
}

function Service(){
    gamePage.ui.render();
    if (!switches["Iron Will"]) {
        gamePage.ironWill = false;
    }
}



function RenderNewTabs(){
    if(gamePage.tabs.filter(tab => tab.tabName != "Stats"  && !ActualTabs.includes(tab)).length > 0) {
        gamePage.tabs.filter(tab => tab.tabName != "Stats" && !ActualTabs.includes(tab)).forEach(tab => tab.render());
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
    }
    //space render
    else if(gamePage.tabs[6].GCPanel.children.filter(res => res.model.on == 1).length != gamePage.tabs[6].planetPanels.length){
        gamePage.tabs[6].render();
        ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
    }
}


if (gamePage.ironWill){
    if (gamePage.resPool.get("zebras").value == 0) {
        gamePage.msg('"Iron Will" mode will be off after 755 game ticks (if not switched)');
    }
    else if (!switches["Iron Will"]){
        autoSwitchEnergy('Iron Will',  'IronWill')
    }

}


gamePage.tabs.filter(tab => tab.tabName != "Stats" ).forEach(tab => tab.render());

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
gamePage.ui.render();
clearInterval(runAllAutomation);

var runAllAutomation = setInterval(function() {
    if (tick != gamePage.timer.ticksTotal) {
        tick = gamePage.timer.ticksTotal;

        setTimeout(autoBuild, 0);
        setTimeout(autoNip, 0);
        setTimeout(autoRefine, 0);

        if (gamePage.timer.ticksTotal % 3 === 0) {
            setTimeout(autoObserve, 0);
            setTimeout(autoCraft2, 0);
            setTimeout(autoHunt, 0);
            setTimeout(autoAssign, 0);
            gamePage.villageTab.updateTab();
        }

        if (gamePage.timer.ticksTotal % 10 === 0) {
            setTimeout(autoSpace, 0);
            setTimeout(energyControl, 0);
        }

        if (gamePage.timer.ticksTotal % 25 === 0) {
             setTimeout(autoResearch, 0);
             setTimeout(autoWorkshop, 0);
             setTimeout(autoParty, 0);
             setTimeout(autoTrade, 0);
             setTimeout(autoPraise, 0);
        }

         if (gamePage.timer.ticksTotal % 50 === 0) {
             setTimeout(Timepage, 0);
        }

        if (gamePage.timer.ticksTotal % 151 === 0) {
            setTimeout(RenderNewTabs, 0);
            setTimeout(UpgradeBuildings, 0);
            if (Iinc == 5) {
                setTimeout(autozig, 0);
                setTimeout(ResearchSolarRevolution, 0);
                setTimeout(Service, 0);
                Iinc = 0;
            }
            Iinc++;
        }
    }

}, 50);

