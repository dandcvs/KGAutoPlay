// These will allow quick selection of the buildings which consume energy
(function(s){var w,f={},o=window,l=console,m=Math,z='postMessage',x='HackTimer.js by turuslan: ',v='Initialisation failed',p=0,r='hasOwnProperty',y=[].slice,b=o.Worker;function d(){do{p=0x7FFFFFFF>p?p+1:0}while(f[r](p));return p}if(!/MSIE 10/i.test(navigator.userAgent)){try{s=o.URL.createObjectURL(new Blob(["var f={},p=postMessage,r='hasOwnProperty';onmessage=function(e){var d=e.data,i=d.i,t=d[r]('t')?d.t:0;switch(d.n){case'a':f[i]=setInterval(function(){p(i)},t);break;case'b':if(f[r](i)){clearInterval(f[i]);delete f[i]}break;case'c':f[i]=setTimeout(function(){p(i);if(f[r](i))delete f[i]},t);break;case'd':if(f[r](i)){clearTimeout(f[i]);delete f[i]}break}}"]))}catch(e){}}if(typeof(b)!=='undefined'){try{w=new b(s);o.setInterval=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2)};w[z]({n:'a',i:i,t:t});return i};o.clearInterval=function(i){if(f[r](i))delete f[i],w[z]({n:'b',i:i})};o.setTimeout=function(c,t){var i=d();f[i]={c:c,p:y.call(arguments,2),t:!0};w[z]({n:'c',i:i,t:t});return i};o.clearTimeout=function(i){if(f[r](i))delete f[i],w[z]({n:'d',i:i})};w.onmessage=function(e){var i=e.data,c,n;if(f[r](i)){n=f[i];c=n.c;if(n[r]('t'))delete f[i]}if(typeof(c)=='string')try{c=new Function(c)}catch(k){l.log(x+'Error parsing callback code string: ',k)}if(typeof(c)=='function')c.apply(o,n.p)};w.onerror=function(e){l.log(e)};l.log(x+'Initialisation succeeded')}catch(e){l.log(x+v);l.error(e)}}else l.log(x+v+' - HTML5 Web Worker is not supported')})('HackTimerWorker.min.js');

var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];
var bldWarehouse = gamePage.bld.buildingsData[11];


var spcContChamber = gamePage.space.meta[5].meta[1];
var spcMoonBase = gamePage.space.meta[2].meta[1];
var spcEntangler = gamePage.space.meta[10].meta[0];
var spcSpaceStation = gamePage.space.meta[1].meta[2];
var spcLunarOutpost = gamePage.space.meta[2].meta[0];
var spcOrbitalArray = gamePage.space.meta[4].meta[1];

 // These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var FreeEnergy = 0;
var deadScript = "Script is dead";
var Iinc = 0;
var IincKAssign = 0;
var tick = 0;
var tick_inactive = 0;
var LeviTradeCnt = 0;
var embRefreshCnt = 0;
var postApocalypse_is_competed = true;
var GlobalMsg = {'craft':'','tech':'','relicStation':'','solarRevolution':'','ressourceRetrieval':'','chronosphere':'', 'science':''};
var science_labels = ['astronomy', 'theology', 'voidSpace', 'paradoxalKnowledge', 'navigation', 'architecture', 'physics', 'chemistry', 'archeology', 'electricity', 'biology'];
var sciencePriority = [null,[]]
var golden_Buildings = ["temple","tradepost"];
var switches = {"Energy Control":true, "Iron Will":false, "CollectResBReset":false}
var ActualTabs = Object.values(gamePage.tabs.filter(tab => tab.tabName != "Stats"));
var craftPriority = [[],[],0,[]];
var NotPriority_blds = ["temple","tradepost","aiCore","unicornPasture","chronosphere","mint","chapel","zebraOutpost","zebraWorkshop","zebraForge", "brewery", "accelerator", "ivoryTemple"];
var f = (a = 1, {x: c} ={ x: a / 10000}) => c;
function calc_sell_rate(res) {
                      let obj = {"name": res.name}
                      if (craftPriority[0].length > 0 && gamePage.bld.getPrices(craftPriority[0]).filter(rest => rest.name == res.name).length > 0 && gamePage.bld.getPrices(craftPriority[0]).filter(rest => rest.name == res.name)[0].val > gamePage.resPool.get(res.name).value){
                        obj.ratio = 0
                      }
                      else if (sciencePriority[0] != null && sciencePriority[1].filter(rest => rest.name == res.name).length > 0 && sciencePriority[1].filter(rest => rest.name == res.name)[0].val > gamePage.resPool.get(res.name).value){
                        obj.ratio = -1
                      }
                      else if ( gamePage.resPool.get(res.name).maxValue != 0) {
                          obj.ratio = gamePage.resPool.get(res.name).value / gamePage.resPool.get(res.name).maxValue * gamePage.resPool.get(res.name).value
                      }
                      else {
                        obj.ratio =  0.1 * gamePage.resPool.get(res.name).value
                      }
                     return obj;
                }

var upgrades_craft = [
[gamePage.workshop.get("printingPress"),[["gear", 45*1.2]]],
[gamePage.workshop.get("fluidizedReactors"),[["alloy",200*1.2]]],
[gamePage.workshop.get("oxidation"),[["steel",5000*1.2]]],
[gamePage.workshop.get("miningDrill"),[["steel",750*1.2]]],
[gamePage.workshop.get("steelPlants"),[["gear",750*1.2]]],
[gamePage.workshop.get("rotaryKiln"),[["gear",500*1.2]]]
];

var policy_lst_all = [
"liberty", "authocracy", "communism",
"socialism", "diplomacy", "zebraRelationsAppeasement",
"knowledgeSharing", "stoicism", "mysticism",
"clearCutting", "fullIndustrialization", "militarizeSpace",
"necrocracy", "expansionism", "frugality", "siphoning", "spiderRelationsGeologists", "lizardRelationsDiplomats",
"sharkRelationsMerchants", "griffinRelationsMachinists", "dragonRelationsPhysicists", "nagaRelationsCultists"
];
var policy_lst_post_apocalypse = [
"liberty", "authocracy", "communism",
"socialism", "diplomacy", "zebraRelationsAppeasement",
"knowledgeSharing", "stoicism", "mysticism",
"environmentalism", "militarizeSpace",
"necrocracy", "expansionism", "frugality", "conservation", "siphoning"
];

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

'<a id="scriptOptions" onclick="selectOptions()"> | KGAutoPlay </a>' +

'<div id="optionSelect" style="display:none; margin-top:-235px; margin-left:-60px; width:200px" class="dialog help">' +
'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
'<hr size=5>' +
'<button id="autoEnergy" style="color:black" onclick="autoSwitch(\'Energy Control\',  \'autoEnergy\')"> Energy Control </button></br>' +
'<hr size=3>' +
'<button id="Collector" title = "Collect late game res(Tcrystal, Relic, Void) before reset." style="color:red" onclick="autoSwitch(\'CollectResBReset\',  \'Collector\')"> CollectResBReset </button></br>' +
'<hr size=3>' +
'<button id="SellSpace" onclick="SellSpaceAndReset();">Sell Space and Reset</button> </br>' +
'<hr size=3>' +
'<button id="IronWill" style="color:red" onclick="autoSwitch(\'Iron Will\',  \'IronWill\')"> IronWill </button></br>' +
'</div>' +
'</div>'

$("#footerLinks").append(htmlMenuAddition);


$(document.querySelector('#rightColumn > div.right-tab-header')).append("<a id='PriorityLabel' title = 'KGAutoPlay:\nLow priority for building construction and some technology.'></a>")
//$(document.querySelector("#midColumn")).append("<a id='PriorityLabel' title = 'KGAutoPlay: Low priority for building construction and some technology.'></a>")

function selectOptions() {
	$("#optionSelect").toggle();
}
function clearOptionHelpDiv() {
	$("#optionSelect").hide();
}

var activeTimeouts = [];

function clearScript() {
    $("#farRightColumn").remove();
    $("#PriorityLabel").remove();
    $("#scriptOptions").remove();
    if (typeof runAllAutomation !== 'undefined' && runAllAutomation) {
        clearInterval(runAllAutomation);
        runAllAutomation = null;
    }
    if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
        activeTimeouts.forEach(id => clearTimeout(id));
        activeTimeouts = [];
    }
    htmlMenuAddition = null;
    GlobalMsg = null;
    switches = null;
}

function autoSwitch(varCheck, varName) {
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

function extractButtonNames(inputString) {
  const div = document.createElement('div');
  div.innerHTML = inputString;

  const labelContent = div.querySelector('.label-content');
  if (!labelContent) {
    div.remove();
    return inputString;
  }

  let result = labelContent.textContent.trim();

  const lastDiv = div.querySelector('div:not(:has(.label-content)):last-child');
  if (lastDiv) {
    const divText = lastDiv.textContent.trim();
    if (divText) result += ' ' + divText;
  }

  const textAfterHtml = inputString.split('>').pop().trim();
  if (textAfterHtml && !textAfterHtml.startsWith('<')) {
    result += ' ' + textAfterHtml;
  }

  div.remove();
  return result;
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

	if (gamePage.religionTab.visible && !gamePage.challenges.isActive("atheism")) {
	    gamePage.tabs[5].update();
	    if (gamePage.religion.meta[1].meta[5].val == 1) {


            if (gamePage.religion.transcendenceTier > 1 && gamePage.religion.getSolarRevolutionRatio() <= Math.max((gamePage.religion.transcendenceTier + 1) * 0.05, gamePage.getEffect("solarRevolutionLimit"))){
                gamePage.religion.praise();
            }
            else {
                var btn = gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))));
                for (var rl = 0; rl < btn.length; rl++) {
                    if (btn[rl].model.enabled && btn[rl].model.visible) {
                        try {
                            var result = btn[rl].controller.buyItem(btn[rl].model, {});
                            if (result && result.itemBought) {
                                btn[rl].update();
                                gamePage.msg('Religion researched: ' + extractButtonNames(btn[rl].model.name));
                            }
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
            }
            if (gamePage.resPool.get("faith").value >= (gamePage.religion.transcendenceTier < 13 ?  Math.min(gamePage.resPool.get("faith").maxValue*0.99, (Math.max(gamePage.religion.transcendenceTier ** 2, 1)) * 10000) : gamePage.resPool.get("faith").maxValue*0.99)){
                if (gamePage.religion.getRU("apocripha").on  && gamePage.religion.getRU("transcendence").on && gamePage.religion.transcendenceTier < 15 && gamePage.religion.getSolarRevolutionRatio() > Math.max((gamePage.religion.transcendenceTier + 1) * 0.05, gamePage.getEffect("solarRevolutionLimit"))) {
                    gamePage.religion.resetFaith(1.01, false);
                }
                else if (gamePage.getEffect("voidResonance") > 0 && gamePage.religion.getRU("apocripha").on  && gamePage.religion.getRU("transcendence").on && (gamePage.religion.faith / gamePage.religion.getApocryphaBonus()) >  gamePage.resPool.get("faith").maxValue * Math.min(gamePage.religion.transcendenceTier, 10, Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")))){
                    gamePage.religion.resetFaith(1.01, false);
                }
                else if ( gamePage.religion.getRU("apocripha").on && gamePage.religion.getRU("transcendence").on && (gamePage.religion.faith / gamePage.religion.getApocryphaBonus()) >  gamePage.resPool.get("faith").maxValue * Math.min(gamePage.religion.transcendenceTier, 10, Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")))){
                    gamePage.religion.resetFaith(1.01, false);
                }
                else {
                    gamePage.religion.praise();
                }
            }

            if (gamePage.religion.getRU("transcendence").on){
                var needNextLevel = gamePage.religion._getTranscendTotalPrice(gamePage.religion.transcendenceTier + 1) - gamePage.religion._getTranscendTotalPrice(gamePage.religion.transcendenceTier);
                if (gamePage.religion.faithRatio > needNextLevel) {

                    gamePage.religion.faithRatio -= needNextLevel;
                    gamePage.religion.tcratio += needNextLevel;
                    gamePage.religion.transcendenceTier += 1;

                    self.game.msg($I("religion.transcend.msg.success", [gamePage.religion.transcendenceTier]));
                }
            }
	    } else if ((gamePage.resPool.get("faith").value >= gamePage.resPool.get("faith").maxValue*0.99)){
            var btn = gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))));
            for (var rl = 0; rl < btn.length; rl++) {
                if (btn[rl].model.enabled && btn[rl].model.visible) {
                    try {
                        var result = btn[rl].controller.buyItem(btn[rl].model, {});
                        if (result && result.itemBought) {
                            btn[rl].update();
                            gamePage.msg('Religion researched: ' + extractButtonNames(btn[rl].model.name));
                        }
                    } catch(err) {
                        console.log(err);
                    }
                }
            }
            if (gamePage.resPool.get("faith").value >= gamePage.resPool.get("faith").maxValue*0.99){
                gamePage.religion.praise();
            }
        } else if (gamePage.resPool.get("faith").value >= gamePage.resPool.get("faith").maxValue*0.99 || gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.metadata.name == "solarRevolution")[0].model.visible == false){
              gamePage.religion.praise();
        }

        if (!switches['CollectResBReset']) {
            if (gamePage.science.get("cryptotheology").researched){
                var btn = gamePage.tabs[5].ctPanel.children[0].children;
                for (var cr = 0; cr < btn.length; cr++) {
                    if (btn[cr].model.enabled && btn[cr].model.visible) {
                        try {
                            var result = btn[cr].controller.buyItem(btn[cr].model, {});
                                if (result && result.itemBought) {
                                    btn[cr].update();
                                    gamePage.msg('Religion Cryptotheology researched: ' + extractButtonNames(btn[cr].model.name));
                                }
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
            }
        }
        if (gamePage.science.getPolicy("siphoning").researched && gamePage.religion.getPact("pactOfCleansing").unlocked && gamePage.getEffect("pactsAvailable") > 0 ){
            if (gamePage.resPool.get("relic").value > 100 && gamePage.resPool.get("necrocorn").value > 10 && (gamePage.religion.getCorruptionPerTick() * (1 + gamePage.timeAccelerationRatio())) > 0.001  && gamePage.diplomacy.get("leviathans").energy >= gamePage.diplomacy.getMarkerCap())  {
                var btn = gamePage.tabs[5].ptPanel.children[0].children.filter(res => res.model.metadata && res.model.metadata.unlocked && res.id == "pactOfCleansing" && res.model.enabled)
                for (var cr = 0; cr < btn.length; cr++) {
                    if (btn[cr].model.enabled && btn[cr].model.visible) {
                        try {
                            var result = btn[cr].controller.buyItem(btn[cr].model, {});
                                if (result && result.itemBought) {
                                    btn[cr].update();
                                    gamePage.msg('Religion Pact accepted: ' + extractButtonNames(btn[cr].model.name));
                                }
                        } catch(err) {
                            console.log(err);
                        }
                    }
                }
            }
        }
        if (gamePage.religion.getPact("payDebt").unlocked && gamePage.resPool.get("necrocorn").value > gamePage.religion.getPact("payDebt").prices[0].val){
            var btn = gamePage.tabs[5].ptPanel.children[0].children.filter(res => res.model.metadata && res.model.metadata.unlocked && res.id == "payDebt" && res.model.enabled)[0]
            try {
                    var result = btn.controller.buyItem(btn.model, {});
                        if (result && result.itemBought) {
                            btn.update();
                            gamePage.msg('Religion : ' + extractButtonNames(btn.model.name));
                        }
                } catch(err) {
                    console.log(err);
                }
        }
	}
}


// Build buildings automatically
function autoBuild() {
    var btn = gamePage.tabs[0].children.filter(res => {
        if (!res.model.metadata || !res.model.metadata.unlocked || res.model.resourceIsLimited) return false;
        if (Object.keys(craftPriority[0]).length > 0) {
            return (
                (res.model.metadata.name == craftPriority[0]) ||
                (NotPriority_blds.indexOf(res.model.metadata.name) > -1) ||
                (res.model.prices.find(ff2 => craftPriority[3].indexOf(ff2.name) != -1 ) === undefined)
            );
        }
        return true;
    });

    var solarRevolution_val =  gamePage.religion.getRU('solarRevolution').val;
    var mint_meta = gamePage.bld.getBuildingExt('mint').meta

    for (var bl = 0; bl < btn.length; bl++) {
        var btnModel = btn[bl].model;
        var btnController = btn[bl].controller;
        btnController.updateEnabled(btnModel);

        if (btnModel.enabled) {
            var btnMetadata = btnModel.metadata;
            var btnPrices = btnModel.prices;

            const goldPrice = btnPrices.find(res => res.name == 'gold');
            const sciencePrice = btnPrices.find(res => res.name == 'science');
            const slabPrice = btnPrices.find(res => res.name == 'slab');
            const mineralsPrice = btnPrices.find(res => res.name == 'minerals');
            const relicPrice = btnPrices.find(res => res.name == 'relic');
            const timeCrystalPrice = btnPrices.find(res => res.name == 'timeCrystal');
            const voidPrice = btnPrices.find(res => res.name == 'void');
            const catnipPrice = btnPrices.find(res => res.name == 'catnip');

            if (!switches['CollectResBReset'] || (!relicPrice && !timeCrystalPrice && !voidPrice)) {
                if ((golden_Buildings.includes(btnMetadata.name) && !gamePage.ironWill) || (gamePage.ironWill && mint_meta.val > 3 && golden_Buildings.includes(btnMetadata.name))) {
                    if ((solarRevolution_val == 1) || (btnMetadata.name == 'temple' && btnMetadata.val < 3) || (goldPrice && goldPrice.val < (gamePage.resPool.get('gold').value - 500)) || (gamePage.resPool.get('gold').value == gamePage.resPool.get('gold').maxValue)) {
                        try {
                            var result = btnController.buyItem(btnModel, {});
                                if (result && result.itemBought) {
                                    btn[bl].update();
                                    gamePage.msg('Build: ' + extractButtonNames(btn[bl].model.name));
                                    return;
                                }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                } else if (btnMetadata.name == "aiCore") {
                    if (btnMetadata.val < Math.floor(spcEntangler.val * 2.5)) {
                        try {
                            var result = btnController.buyItem(btnModel, {});
                                if (result && result.itemBought) {
                                    btn[bl].update();
                                    gamePage.msg('Build: ' + extractButtonNames(btn[bl].model.name));
                                    return;
                                }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                } else if (btnMetadata.name == "biolab" && gamePage.resPool.get("alloy").value < 200) {
                    // Do nothing
                } else if (btnMetadata.name == "field" && gamePage.challenges.isActive("postApocalypse") && gamePage.bld.getPollutionLevel() >= 5 && btnMetadata.val >= 95 - gamePage.time.getVSU("usedCryochambers").val - gamePage.bld.getPollutionLevel()) {
                    // Do nothing
                } else if (btnMetadata.name == "field" && !gamePage.science.get('engineering').researched && gamePage.calendar.season >= 1 && catnipPrice && catnipPrice.val * 3 > gamePage.resPool.get('catnip').value && gamePage.resPool.get('catnip').value < gamePage.resPool.get('catnip').maxValue * 0.9) {
                    // Do nothing
                } else if (btnMetadata.name == "chronosphere") {
                    if ((gamePage.workshop.get("chronoforge").researched && gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10 && ((gamePage.time.meta[0].meta[6].unlocked && gamePage.resPool.get("timeCrystal").value < gamePage.timeTab.cfPanel.children[0].children[8].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.timeTab.cfPanel.children[0].children[8].model.metadata.val > 3 ? 0.9 : 0.05)) || !gamePage.science.get("paradoxalKnowledge").researched)) ||
                        (gamePage.bld.getBuildingExt('chronosphere').meta.val < 20 && gamePage.timeTab.visible && gamePage.resPool.get("timeCrystal").value - Chronosphere10SummPrices()["timeCrystal"] > 100 && gamePage.time.meta[0].meta[6].val > 0) ||
                        (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 && ((gamePage.resPool.get("unobtainium").value >= Chronosphere10SummPrices()["unobtainium"] && gamePage.resPool.get("timeCrystal").value >= Chronosphere10SummPrices()["timeCrystal"]) || gamePage.resPool.get("unobtainium").value >= gamePage.resPool.get("unobtainium").maxValue))) {
                        try {
                            var result = btnController.buyItem(btnModel, {});
                                if (result && result.itemBought) {
                                    btn[bl].update();
                                    gamePage.msg('Build: ' + extractButtonNames(btn[bl].model.name));
                                    return;
                                }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                } else if (gamePage.ironWill) {
                    if (!btnMetadata.effects.maxKittens) {
                        if ((btnMetadata.name == "pasture" && !solarRevolution_val) ||
                            (!gamePage.workshop.get("goldOre").researched && sciencePrice && sciencePrice.length > 0) ||
                            (gamePage.bld.getBuildingExt('workshop').meta.unlocked && gamePage.bld.getBuildingExt('workshop').meta.val == 0 && gamePage.bld.getBuildingExt('workshop').meta.name != btnMetadata.name && (mineralsPrice && mineralsPrice.length > 0)) ||
                            (!gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked && gamePage.bld.getBuildingExt('workshop').meta.val > 0 && (mineralsPrice && mineralsPrice.length > 0)) ||
                            ((gamePage.bld.getBuildingExt('amphitheatre').meta.unlocked && gamePage.bld.getBuildingExt('amphitheatre').meta.val <= 10 && gamePage.bld.getBuildingExt('workshop').meta.val > 0 && gamePage.bld.getBuildingExt('amphitheatre').meta.name != btnMetadata.name) && mineralsPrice && mineralsPrice.length > 0) ||
                            ((solarRevolution_val == 0 && gamePage.bld.getBuildingExt('temple').meta.unlocked && gamePage.bld.getBuildingExt('temple').meta.val < 3 && gamePage.bld.getBuildingExt('amphitheatre').meta.val > 10 && gamePage.science.get('philosophy').researched && gamePage.bld.getBuildingExt('temple').meta.name != btnMetadata.name) && slabPrice && slabPrice.length > 0) ||
                            (((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked) || (!gamePage.science.get('philosophy').researched && gamePage.science.get('philosophy').unlocked) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked)) && sciencePrice && sciencePrice.length > 0 && sciencePrice[0].val > 1000)) {
                            // Do nothing
                        } else {
                            try {
                            var result = btnController.buyItem(btnModel, {});
                                if (result && result.itemBought) {
                                        btn[bl].update();
                                        gamePage.msg('Build: ' + extractButtonNames(btn[bl].model.name));
                                        return;
                                    }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    }
                } else {
                    try {
                            var result = btnController.buyItem(btnModel, {});
                                if (result && result.itemBought) {
                                    btn[bl].update();
                                    gamePage.msg('Build: ' + extractButtonNames(btn[bl].model.name));
                                    return;
                                }
                    } catch (err) {
                        console.log(err);
                    }
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
                    for (var sp = 0 ;sp < spBuild.length; sp++) {
                        if (spBuild[sp].model.metadata.unlocked) {
                            const relicPrice = spBuild[sp].model.prices.find(res => res.name == 'relic');
                            const timeCrystalPrice = spBuild[sp].model.prices.find(res => res.name == 'timeCrystal');
                            const voidPrice = spBuild[sp].model.prices.find(res => res.name == 'void');
                            const antimatterPrice = spBuild[sp].model.prices.find(res => res.name == 'antimatter');
                            const eludiumPrice = spBuild[sp].model.prices.find(res => res.name == 'eludium');
                            const unobtainiumPrice = spBuild[sp].model.prices.find(res => res.name == 'unobtainium');
                            if (!switches['CollectResBReset'] || (!relicPrice && !timeCrystalPrice && !voidPrice)) {
                                if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched  && antimatterPrice && (!gamePage.challenges.isActive("energy")  && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue )){
                                    {}
                                }
                                else if (!gamePage.science.get('voidSpace').researched &&  ["hydroponics", "moonBase", "sunlifter", "cryostation", "heatsink"].includes(spBuild[sp].model.metadata.name) && (!eludiumPrice || eludiumPrice.val > 500) &&  gamePage.resPool.get("unobtainium").value < gamePage.resPool.get("unobtainium").maxValue * 0.5 ){
                                    {}
                                }
                                else if ( ["moonBase"].includes(spBuild[sp].model.metadata.name)  &&  gamePage.resPool.get("unobtainium").value < gamePage.resPool.get("unobtainium").maxValue * 0.5  && unobtainiumPrice && unobtainiumPrice.val > gamePage.resPool.get("eludium").value){
                                    {}
                                }
                                else if ( spBuild[sp].model.metadata.name == "hydroponics" && unobtainiumPrice && unobtainiumPrice.val > gamePage.resPool.get("eludium").value){
                                    {}
                                }
                                else if (gamePage.ironWill){
                                    if(!spBuild[sp].model.metadata.effects.maxKittens){
                                         var result = spBuild[sp].controller.buyItem(spBuild[sp].model, {});
                                         if (result && result.itemBought) {
                                            spBuild[sp].update();
                                            gamePage.msg('Build in Space: ' + extractButtonNames(spBuild[sp].model.name));
                                            return;
                                        }
                                    }
                                }else{
                                    var result = spBuild[sp].controller.buyItem(spBuild[sp].model, {});
                                    if (result && result.itemBought) {
                                        spBuild[sp].update();
                                        gamePage.msg('Build in Space: ' + extractButtonNames(spBuild[sp].model.name));
                                        return;
                                    }
                                }
                            }
                        }
                    }
                } catch(err) {
                console.log(err);
                }
        }
        // Build space programs
        var spcProg = gamePage.tabs[6].GCPanel.children;
        for (var sp = 0; sp < spcProg.length; sp++) {
            if (spcProg[sp].model.metadata.unlocked && spcProg[sp].model.on == 0) {
                try {
                        var result = spcProg[sp].controller.buyItem(spcProg[sp].model, {});
                        if (result && result.itemBought) {
                            spcProg[sp].update();
                            gamePage.msg('Research Space program: ' + extractButtonNames(spcProg[sp].model.name ));
                            return;
                        }
                } catch(err) {
                console.log(err);
                }
            }
        }
	}
}

// Trade automatically
function autoTrade() {
    GlobalMsg["ressourceRetrieval"] = ''
    const timeMeta = gamePage.time.meta[0].meta[6];
    const timeChild = gamePage.timeTab.cfPanel.children[0].children[8];
    const timeCrystalPrice = timeChild.model.prices.find(res => res.name == "timeCrystal");
    if (timeMeta.unlocked && gamePage.resPool.get("timeCrystal").value > (timeCrystalPrice ? timeCrystalPrice.val * (timeChild.model.metadata.val > 3 ? 0.9 : 0.05) : 0)) {
        GlobalMsg["ressourceRetrieval"] = timeChild.model.metadata.label + '(' + (timeChild.model.metadata.val+1) + ') ' + Math.round((gamePage.resPool.get("timeCrystal").value / (timeCrystalPrice ? timeCrystalPrice.val : 1)) * 100) + '%'
    }

    if (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 && gamePage.resPool.get("timeCrystal").value < (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ? Chronosphere10SummPrices()["timeCrystal"] : 6)){
        if (gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
            const unoRes = gamePage.resPool.get('unobtainium');
            if (unoRes.value > 5000 && timeMeta.unlocked && gamePage.resPool.get("timeCrystal").value > (timeCrystalPrice ? timeCrystalPrice.val * (timeChild.model.metadata.val > 3 ? 0.9 : 0.05) : 0)){
                gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
            }else if(unoRes.value > 5000 && ((gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10 && gamePage.resPool.get("timeCrystal").value <= gamePage.resPool.get("eludium").value / 2 )  || switches['CollectResBReset'] )) {
                gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
            }
        }
    }
    if  ((gamePage.resPool.get('titanium').value > 5000 || gamePage.bld.getBuildingExt('reactor').meta.val > 0 ) && gamePage.resPool.get('uranium').value <  Math.min(gamePage.resPool.get('paragon').value,100) && gamePage.diplomacy.get('dragons').unlocked && gamePage.resPool.get('gold').value < gamePage.resPool.get('gold').maxValue * 0.95) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"), 1);
        }

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
        let cultureRes = gamePage.resPool.get('culture');
        if ((cultureRes.value >= 10000 || cultureRes.value >= cultureRes.maxValue) || gamePage.challenges.isActive("pacifism")) {
                embRefreshCnt += 1;
                if (embRefreshCnt >= 10){
                     gamePage.diplomacyTab.render();
                     embRefreshCnt = 0;
                }
                embassy_buttons = gamePage.diplomacyTab.racePanels.filter( emb => emb.race.unlocked && emb.embassyButton != null && !emb.embassyButton.model.resourceIsLimited)
                if (embassy_buttons.length > 0) {
                    btn = embassy_buttons.sort(function(a, b) {return  a.race.embassyLevel - b.race.embassyLevel;})[0]
                    var result = btn.embassyButton.controller.buyItem(btn.embassyButton.model, {});
                        if (result && result.itemBought) {
                            btn.embassyButton.update();
                            return;
                        }
                }
        }

         if (gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
            //blackcoin  speculation
            if (gamePage.science.get("blackchain").researched || gamePage.resPool.get("blackcoin").value > 0) {
                if (gamePage.resPool.get("blackcoin").value > 0 && gamePage.calendar.cryptoPrice > 1090 ) {
                    gamePage.diplomacy.sellBcoin()
                }
                if (!switches['CollectResBReset'] && gamePage.resPool.get("relic").value > (1000 + gamePage.resPool.get("blackcoin").value * 1000) && gamePage.calendar.cryptoPrice < 1000 ) {
                    gamePage.diplomacy.buyBcoin()
                }
            }
         }

        if(((gamePage.religion.getRU('solarRevolution').val == 1 || ((gamePage.challenges.isActive("atheism") || gamePage.challenges.isActive("pacifism") ) && (gamePage.resPool.get('gold').value > 550 || gamePage.bld.getBuildingExt('mint').meta.val > 0 )  )) || (gamePage.resPool.get('gold').value == gamePage.resPool.get('gold').maxValue && gamePage.resPool.get('gold').maxValue < 500)) || (gamePage.ironWill)){
            if ((goldResource.value > goldResource.maxValue * 0.95 || ((gamePage.bld.getBuildingExt('mint').meta.val > 0  && goldResource.value > (gamePage.bld.getBuildingExt('accelerator').meta.val < 1 ? 90 : Math.min(gamePage.bld.getBuildingExt('accelerator').meta.val * 1000, 10000))) ||  gamePage.religion.getRU("transcendence").on) || ((gamePage.challenges.isActive("atheism") || gamePage.challenges.isActive("pacifism")) && goldResource.value > 500)   ) || (gamePage.ironWill && goldResource.value > (gamePage.religion.getRU('solarRevolution').val == 1 ? 15 : 600) ) || (gamePage.resPool.get('blueprint').value < 300 && gamePage.religion.getRU('solarRevolution').val == 1 && goldResource.value > 90)) {
                if (gamePage.diplomacyTab.racePanels.length != gamePage.diplomacy.races.filter(race => race.unlocked).length) {
                    gamePage.diplomacyTab.render();
                }

                if (gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
                    if (unoRes.value > 5000 && gamePage.time.meta[0].meta[6].unlocked && gamePage.resPool.get("timeCrystal").value > gamePage.timeTab.cfPanel.children[0].children[8].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.timeTab.cfPanel.children[0].children[8].model.metadata.val > 3 ? 0.9 : 0.05)){
                        gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
                    }else if(unoRes.value > 5000 && ((gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10 && gamePage.resPool.get("timeCrystal").value <= gamePage.resPool.get("eludium").value / 2 )  || switches['CollectResBReset'] )) {
                        gamePage.diplomacy.tradeMultiple(game.diplomacy.get("leviathans"),Math.min( gamePage.diplomacy.getMaxTradeAmt(game.diplomacy.get("leviathans")), Math.max(Math.floor(gamePage.resPool.get('unobtainium').value/5000),1)));
                    }

                    //Feed elders
                    if (gamePage.diplomacy.get("leviathans").energy < gamePage.diplomacy.getMarkerCap() && ((gamePage.resPool.get("necrocorn").value > (gamePage.diplomacy.get("leviathans").energy + 1)) || (gamePage.resPool.get("necrocorn").value >= 1 && (gamePage.religion.getCorruptionPerTick() * (1 + gamePage.timeAccelerationRatio())) > 0.001))){
                        gamePage.diplomacy.feedElders();
                    }
                }

                // name, buys, sells
                let tradersAll = [
                 ['zebras',
                 gamePage.diplomacy.get('zebras').buys,
                 [...gamePage.diplomacy.get('zebras').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('zebras'))), {"name": "titanium"}].map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['griffins',
                 gamePage.diplomacy.get('griffins').buys,
                 gamePage.diplomacy.get('griffins').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('griffins'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['lizards',
                 gamePage.diplomacy.get('lizards').buys,
                 gamePage.diplomacy.get('lizards').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('lizards'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['sharks',
                 gamePage.diplomacy.get('sharks').buys,
                 gamePage.diplomacy.get('sharks').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('sharks'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['nagas',
                 gamePage.diplomacy.get('nagas').buys,
                 gamePage.diplomacy.get('nagas').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('nagas'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['spiders',
                 gamePage.diplomacy.get('spiders').buys,
                 gamePage.diplomacy.get('spiders').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('spiders'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                 ['dragons',
                 gamePage.diplomacy.get('dragons').buys,
                 gamePage.diplomacy.get('dragons').sells.filter(sl => gamePage.diplomacy.isValidTrade(sl, gamePage.diplomacy.get('dragons'))).map(calc_sell_rate).sort(function(a, b) {return  a.ratio - b.ratio;})
                 ],
                ]
                let trade = tradersAll.filter(tr => gamePage.diplomacy.get(tr[0]).unlocked && tr[1][0].val <= gamePage.resPool.get(tr[1][0].name).value && gamePage.resPool.get(tr[1][0].name).value >= (gamePage.resPool.get(tr[1][0].name).maxValue != 0 ? gamePage.resPool.get(tr[1][0].name).maxValue * 0.01 : 0)).sort(function(a, b) {return  a[2][0].ratio - b[2][0].ratio;})[0]

                if (trade) {
                    if (gamePage.ironWill) {
                            if (trade[0] == 'griffins' &&  gamePage.resPool.get(trade[1][0].name).value > gamePage.resPool.get(trade[1][0].name).maxValue * 0.8 ) {
                                gamePage.diplomacy.tradeMultiple(gamePage.diplomacy.get(trade[0]), Math.floor(gamePage.diplomacy.getMaxTradeAmt(gamePage.diplomacy.get(trade[0])) / 10));
                            }
                            else {
                                gamePage.diplomacy.tradeAll(gamePage.diplomacy.get(trade[0]));
                            }
                    }
                    else {
                        if (trade[0] == 'nagas') {
                            // Do nothing
                        }
                        else {
                             gamePage.diplomacy.tradeAll(gamePage.diplomacy.get(trade[0]));
                        }
                    }
                }
            }
        }

}

// Hunt automatically
function autoHunt() {
    var tmpvalue =  gamePage.resPool.get('furs').value
	var catpower = gamePage.resPool.get('manpower');
		if (!gamePage.challenges.isActive("pacifism") && (catpower.value > (catpower.maxValue * 0.9) || (tmpvalue/catpower.maxValue < 0.02))) {
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
			["unobtainium", "eludium", 1000],
			["furs", "parchment", 175]
                ];



var NotPriority_blds = ["temple","tradepost","aiCore","unicornPasture","chronosphere","mint","chapel","zebraOutpost","zebraWorkshop","zebraForge", "brewery", "accelerator", "ivoryTemple"];


var craftPriority = [[],[],0,[]]
var cntcrafts = 0
var reslist = {}
var reslist2 = []
var cnt = 0

function autoCraft2() {
    var resCache = {};
    [
        "eludium", "steel", "titanium", "unobtainium", "timeCrystal", "oil", "ship", "starchart", "plate", "parchment", "culture", "manuscript", "compedium", "uranium", "slab", "beam", "furs", "minerals", "wood", "iron", "coal", "alloy", "kerosene", "bloodstone", "ivory", "tMythril", "gold", "paragon", "blueprint"
    ].forEach(function(name) {
        var resObj = gamePage.resPool.get(name);
        resCache[name] = { value: resObj ? resObj.value : 0, maxValue: resObj ? resObj.maxValue : 0 };
    });

    var resourcesAll = [
        ["beam", [["wood",175]], Math.min(resCache["wood"].value/175*(gamePage.getCraftRatio()+1),50000),true, true],
        ["slab", [["minerals",250]], Math.min(resCache["minerals"].value/250*(gamePage.getCraftRatio()+1),50000), gamePage.ironWill ? false : true, true],
        ["steel", [["iron",100],["coal",100]], Math.min(Math.max(Math.min(resCache["iron"].value/100*gamePage.getCraftRatio()+1,resCache["coal"].value/100*(gamePage.getCraftRatio()+1)),75),50000),true, true],
        (gamePage.bld.getBuildingExt('reactor').meta.unlocked && !gamePage.resPool.isStorageLimited(gamePage.bld.getPrices('reactor'))) ?
        ["plate", [["iron",125]], gamePage.ironWill ? 15 : resCache["plate"].value < 200 ? 200 : (resCache["titanium"].value > 300 ? gamePage.bld.getPrices('reactor')[1].val : 200), false, true] :
        ["plate", [["iron",125]], gamePage.ironWill ? 15 : (resCache["plate"].value < 150 && gamePage.science.get("navigation").researched) ? 150 :  Math.min(resCache["iron"].value/125*(gamePage.getCraftRatio()+1),50000),true, true],
        ["concrate", [["steel",25],["slab",2500]], resCache["eludium"].value > 125 ? resCache["steel"].value : 0, true, true],
        ["gear", [["steel",15]],25,true, true],
        ["alloy", [["steel",75],["titanium",10]], resCache["eludium"].value > 125 ? resCache["steel"].value : (resCache["titanium"].value < 20 ? 0 : Math.min(Math.max(Math.min(resCache["steel"].value/75*(gamePage.getCraftRatio()+1),resCache["titanium"].value/10*(gamePage.getCraftRatio()+1)), gamePage.workshop.get("geodesy").researched ? 50 : 0),1000)),false, true],
        ["eludium", [["unobtainium",1000],["alloy",2500]], resCache["eludium"].value < 125 ? 125 : (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ? 125 : resCache["eludium"].value < 500 ? 500 : ((resCache["unobtainium"].value > resCache["unobtainium"].maxValue * 0.9 || resCache["unobtainium"].value >= Math.max(resCache["eludium"].value, (resCache["timeCrystal"].value > 1000000 ? resCache["unobtainium"].maxValue * 0.3 : (resCache["eludium"].value < 100000 ? 200000 : resCache["unobtainium"].maxValue * 0.1)))) ? resCache["timeCrystal"].value * 2 + 1 : 0)), false, true],
        ["scaffold", [["beam",50]],0,true, true],
        ["ship", [["scaffold",100],["plate",150],["starchart",25]],!gamePage.workshop.get("geodesy").researched ? 100 : (resCache["starchart"].value > 600 || resCache["ship"].value > 500) ? Math.min(resCache["plate"].value ,(100 + (resCache["starchart"].value - 500)/25)) :100 ,true, true],
        ["tanker", [["ship",200],["kerosene",resCache["oil"].maxValue * 2],["alloy",1250],["blueprint",5]],0,true, true],
        ["kerosene", [["oil",7500]],Math.min(resCache["oil"].value/7500*(gamePage.getCraftRatio()+1),50000),true, true],
        ["parchment", [["furs",175]],resCache["starchart"].value > 1 ? (gamePage.religion.getRU('solarRevolution').val == 1 ? resCache["furs"].value / 3 : 100) : 0,true, true],
        ["manuscript", [["parchment",25],["culture",400]], gamePage.ironWill ? (resCache["culture"].value > 1600 || gamePage.diplomacy.get('nagas').unlocked ? 50 : 0) : ((gamePage.religion.getRU('solarRevolution').val == 1 && resCache["culture"].value >= resCache["culture"].maxValue) ? resCache["parchment"].value / 3 : 200), true, gamePage.ironWill ? (resCache["culture"].value > 1600 || gamePage.diplomacy.get('nagas').unlocked ? true : false) : true],
        ["compedium", [["manuscript",50],["science",10000]],gamePage.ironWill ? (gamePage.science.get('astronomy').researched ? Math.min(gamePage.resPool.get("science").value/10000*(gamePage.getCraftRatio()+1),1500): 0) : (gamePage.religion.getRU('solarRevolution').val == 1 ? resCache["manuscript"].value / 3 : 110), true, resCache["manuscript"].value > 200 ? true : false],
        ["blueprint", [["compedium",25],["science",25000]],0,true, resCache["compedium"].value > 200 ? true : false],
        ["thorium", [["uranium",250]],Math.min(resCache["uranium"].value/250*(gamePage.getCraftRatio()+1),50000),true, true],
        ["megalith", [["slab",50],["beam",25],["plate",5]], Math.min(resCache["slab"].value, resCache["beam"].value, resCache["plate"].value), true, resCache["manuscript"].value > 300 ? true : false],
        ["tMythril", [["bloodstone",5],["ivory",1000],["titanium",500]],5, true, (gamePage.ironWill && resCache["tMythril"].value < 5) ? true : false]
    ];


            if (!gamePage.ironWill && (cntcrafts == 0 || cntcrafts > 200 || (Object.keys(craftPriority[0]).length > 0 && craftPriority[2] != gamePage.bld.getBuildingExt(craftPriority[0]).meta.val))) {
                var Priority_blds = {
                    "hut" : gamePage.science.get('agriculture').researched ? (gamePage.bld.getBuildingExt('mine').meta.val > 0 ? 7 * ((resCache["paragon"].value > 200 || gamePage.village.getKittens() > 70) ? 1 : (!gamePage.challenges.anyChallengeActive() && gamePage.religion.getRU('solarRevolution').val == 1 && resCache["paragon"].value < 200) ? 10 : 2) : 5) : 1,
                    "logHouse" : 7 * ((resCache["paragon"].value > 200 || gamePage.village.getKittens() > 70) ? 1 : (!gamePage.challenges.anyChallengeActive() && gamePage.religion.getRU('solarRevolution').val == 1 && resCache["paragon"].value < 200) ? 10 : 2),
                    "mansion" :  (resCache["titanium"].value > 300 && (resCache["steel"].value > 300 || gamePage.bld.getBuildingExt('mansion').meta.val > 10)) ? 1.5 : 0.00000001,
                    "steamworks" : (gamePage.challenges.isActive("pacifism") && gamePage.bld.getBuildingExt('steamworks').meta.val < 5) ? 50 : ((gamePage.bld.getBuildingExt('magneto').meta.val > 0) ? 2 : 0.00000001),
                    "magneto" : gamePage.bld.getBuildingExt('magneto').meta.val > 10 ? 2 : 0.00000001,
                    "factory"  : (resCache["titanium"].value > 300 && gamePage.bld.getBuildingExt('magneto').meta.val > 10) ? 3 : 0.00000001,
                    "reactor" : gamePage.bld.getBuildingExt('magneto').meta.val > 10 ? 10 : 0.00000001,
                    "warehouse" : gamePage.bld.getBuildingExt('warehouse').meta.stage == 1 ? 0 : 0.0001,
                    "quarry" : gamePage.bld.getBuildingExt('quarry').meta.val < 5 ? 10 : 1.1,
                    "harbor" : (gamePage.bld.getBuildingExt('harbor').meta.val > 100 || (resCache["ship"].value > 0 && resCache["plate"].value > gamePage.bld.getPrices('harbor').filter(res => res.name == "plate")[0].val)) ? 1 : 0.0001,
                    "smelter" : gamePage.bld.getBuildingExt("amphitheatre").meta.val > 0 ? (gamePage.religion.getRU("solarRevolution").val == 0 ? (  (resCache["gold"].value < 500 && gamePage.bld.getBuildingExt("smelter").meta.on == gamePage.bld.getBuildingExt("smelter").meta.val) ? 100 : 5) : 5) : gamePage.challenges.isActive("pacifism") ? 100: 0.0001,
                    "observatory" : (!gamePage.challenges.isActive("blackSky") & resCache["ship"].value == 0 && gamePage.religion.getRU("solarRevolution").val == 1) ? 100 : (resCache["ship"].value == 0 && gamePage.bld.getBuildingExt('observatory').meta.val > 10  && resCache["starchart"].value >= 25) ? 0.00000001 : ((gamePage.religion.getRU("solarRevolution").val == 1 || gamePage.challenges.isActive("atheism")) ? 0.5 : 0.0001),
                    "oilWell" : (gamePage.bld.getBuildingExt('oilWell').meta.val == 0 && resCache["coal"].value > 0 ) ? 10 : (resCache["oil"].value < 500 ? 1 : 0.01),
                    "lumberMill" :gamePage.bld.getPrices("lumberMill").filter(res => res.name == "iron")[0].val + 150 <= resCache["iron"].value ? 1 : (gamePage.religion.getRU("solarRevolution").val == 1 ? 0.005 : 0.0001) * (resCache["paragon"].value > 200 ? 1 : 2),
                    "calciner" : ((resCache["titanium"].value > 0 && (gamePage.bld.getBuildingExt('calciner').meta.val > 10 || resCache["oil"].value > gamePage.bld.getPrices('calciner').filter(res => res.name == "oil")[0].val)) || gamePage.challenges.isActive("blackSky")) ? (gamePage.bld.getPrices('calciner').filter(res => res.name == "oil")[0].val < resCache["oil"].maxValue * 0.3 || (resCache["kerosene"].value > resCache["oil"].maxValue * 0.4 && gamePage.bld.getPrices('calciner').filter(res => res.name == "oil")[0].val < resCache["kerosene"].value)) ? (gamePage.bld.getBuildingExt('calciner').meta.val == 0 ? 10 : 1.1) :  0.00000001 : 0.00000001,
                    "biolab" : gamePage.bld.getBuildingExt('biolab').meta.val > 500 ? 1 : 0.0001,
                    "aqueduct" : gamePage.bld.getBuildingExt('aqueduct').meta.stage == 1 ? 0.01 : 0.1,
                    "amphitheatre" : (gamePage.bld.getBuildingExt('amphitheatre').meta.val == 0 && resCache["parchment"].value > 0) ? 7 : (gamePage.bld.getBuildingExt('amphitheatre').meta.stage == 0 && resCache["parchment"].value > 0) ? 3 : 0.00000001,
                    "ziggurat" : gamePage.bld.getBuildingExt('ziggurat').meta.val > 100 ? 1 :  (gamePage.bld.getBuildingExt('ziggurat').meta.val < 20 && gamePage.bld.getPrices("ziggurat").filter(res => res.name == "blueprint")[0].val <= resCache["blueprint"].value && gamePage.science.get('theology').researched && resCache["blueprint"].value > 100 ) ? 0.1 : (resCache["blueprint"].value > 500 ? 0.01 : 0.00000001),
                    "mine":  gamePage.bld.getBuildingExt('mine').meta.val > 0 ? 1 * (resCache["paragon"].value > 200 ? 1 : 2) : 10,
                    "workshop":  gamePage.bld.getBuildingExt('workshop').meta.val > 0 ? 2 : 10,
                    "pasture": 0.0001,
                    "library": gamePage.bld.getBuildingExt('library').meta.val <= 10 ? 1 : 0.01,
                    "field" : (gamePage.challenges.isActive("postApocalypse") && gamePage.bld.getPollutionLevel() >= 5 || !gamePage.science.get('engineering').researched) ? 0 : 0.01
                };
                var allblds = gamePage.tabs[0].children.filter(res => res.model.metadata && res.model.metadata.unlocked && !res.model.resourceIsLimited)
                var prior = [];
                for (var prc = 0; prc < allblds.length; prc++)  {
                    if (!gamePage.ironWill || (!allblds[prc].model.metadata.effects.maxKittens)) {
                        if (allblds[prc].model.metadata.name in Priority_blds && (allblds[prc].model.prices.filter(res => res.name == "blueprint").length > 0 ? (allblds[prc].model.metadata.val > 0 || gamePage.resPool.get("blueprint").value > allblds[prc].model.prices.filter(res => res.name == "blueprint")[0].val ) : true)) {
                            if (Priority_blds[allblds[prc].model.metadata.name] != 0){
                                prior[prior.length] = [Priority_blds[allblds[prc].model.metadata.name], allblds[prc].model.metadata.name, allblds[prc].model.prices]
                            }
                        }
                        else if ((allblds[prc].model.prices.filter(res => res.name == "blueprint").length > 0 ? (allblds[prc].model.metadata.val > 0 || gamePage.resPool.get("blueprint").value > allblds[prc].model.prices.filter(res => res.name == "blueprint")[0].val) : true) && NotPriority_blds.indexOf(allblds[prc].model.metadata.name) === -1)  {
                            prior[prior.length] = [0.1, allblds[prc].model.metadata.name, allblds[prc].model.prices]
                        }
                    }
                }
                prior = prior.sort(function(a, b) {
                    return ( Object.keys(a[2]).reduce(function(c, d) {
                    var res_sum = 1
                    var res_sum_sub = 1
                    if (a[2][d].val > gamePage.resPool.get(a[2][d].name).value) {
                        res_sum = a[2][d].val - gamePage.resPool.get(a[2][d].name).value
                        for (var g = 0; g < resourcesAll.length; g++)  {
                             if ( a[2][d].name == resourcesAll[g][0] ) {
                                res_sum = 1
                                differ =  a[2][d].val - gamePage.resPool.get(a[2][d].name).value
                                for (var h = 0; h < resourcesAll[g][1].length;h++) {
                                     for (var g2 = 0; g2 < resourcesAll.length; g2++)  {
                                         if ( resourcesAll[g][1][h][0] == resourcesAll[g2][0] ) {
                                            res_sum_sub = 1
                                            differ2 =  (resourcesAll[g][1][h][1] * differ)/(gamePage.getCraftRatio()+1) - gamePage.resPool.get(resourcesAll[g2][0]).value
                                            for (var h2 = 0; h2 < resourcesAll[g2][1].length;h2++) {
                                                 res_sum_sub += (resourcesAll[g2][1][h2][1] * differ2)/(gamePage.getCraftRatio()+1)
                                            }
                                         }
                                    }
                                    res_sum += Math.max((resourcesAll[g][1][h][1] * differ)/(gamePage.getCraftRatio()+1), res_sum_sub)
                                }
                             }
                        }
                    }

                    return c + res_sum } , 0)/a[0] - Object.keys(b[2]).reduce(function(c, d) {
                    var res_sum = 1
                    var res_sum_sub = 1
                    if (b[2][d].val >  gamePage.resPool.get(b[2][d].name).value) {
                        res_sum = b[2][d].val - gamePage.resPool.get(b[2][d].name).value
                        for (var g = 0; g < resourcesAll.length; g++)  {
                             if ( b[2][d].name == resourcesAll[g][0]) {
                                res_sum = 1
                                differ =  b[2][d].val - gamePage.resPool.get(b[2][d].name).value
                                for (var h = 0; h < resourcesAll[g][1].length;h++) {
                                        for (var g2 = 0; g2 < resourcesAll.length; g2++)  {
                                             if ( resourcesAll[g][1][h][0] == resourcesAll[g2][0] ) {
                                                res_sum_sub = 1
                                                differ2 =  (resourcesAll[g][1][h][1] * differ)/(gamePage.getCraftRatio()+1) - gamePage.resPool.get(resourcesAll[g2][0]).value
                                                for (var h2 = 0; h2 < resourcesAll[g2][1].length;h2++) {
                                                     res_sum_sub += (resourcesAll[g2][1][h2][1] * differ2)/(gamePage.getCraftRatio()+1)
                                                }
                                             }
                                        }
                                        res_sum += Math.max((resourcesAll[g][1][h][1] * differ)/(gamePage.getCraftRatio()+1), res_sum_sub)
                                }
                             }
                        }
                    }
                    return c + res_sum }  ,0)/b[0]);

                });

                //priority bluildings
                if (prior.length > 0) {
                    reslist = {}
                    reslist2 = []
                    bld_prior = prior[0]
                    if (prior.length > 4 && cntcrafts == 0 && ["logHouse", "hut"].includes(craftPriority[0])){
                        idxlastbld = prior.slice(0, 5).map(item => item[1]).indexOf(craftPriority[0])
                        if (idxlastbld != -1){
                            bld_prior = prior[idxlastbld]
                        }
                    }

                    for (var prc = 0; prc < bld_prior[2].length; prc++)  {
                         reslist[bld_prior[2][prc].name] = bld_prior[2][prc].val
                         reslist2[reslist2.length] = bld_prior[2][prc].name

                         for (var g = 0; g < resourcesAll.length; g++)  {
                            if (bld_prior[2][prc].name == resourcesAll[g][0]) {
                                for (var h = 0; h < resourcesAll[g][1].length;h++) {

                                    if (isNaN(reslist[resourcesAll[g][1][h][0]])) {
                                       let tmpval = (resourcesAll[g][1][h][1] * (bld_prior[2][prc].val - gamePage.resPool.get(bld_prior[2][prc].name).value ) - gamePage.resPool.get(resourcesAll[g][1][h][0]).value)/(gamePage.getCraftRatio()+1)
                                       reslist[resourcesAll[g][1][h][0]] = tmpval < 0 ? 1 : Math.max(tmpval, gamePage.resPool.get(resourcesAll[g][1][h][0]).value)
                                    }
                                    else {
                                       let tmpval =  Math.max(reslist[resourcesAll[g][1][h][0]], (resourcesAll[g][1][h][1] * (bld_prior[2][prc].val - gamePage.resPool.get(bld_prior[2][prc].name).value ) - gamePage.resPool.get(resourcesAll[g][1][h][0]).value)/(gamePage.getCraftRatio()+1))
                                       reslist[resourcesAll[g][1][h][0]] = tmpval < 0 ? 1 : Math.max(tmpval, gamePage.resPool.get(resourcesAll[g][1][h][0]).value)
                                    }
                                    reslist2[reslist2.length] = resourcesAll[g][1][h][0]
                                }
                            }
                         }
                    }
                    craftPriority = [bld_prior[1], bld_prior[2], gamePage.bld.getBuildingExt(bld_prior[1]).meta.val, reslist2]
                }
                cntcrafts = 0
            }

            if (Object.keys(craftPriority[0]).length > 0) {
                cntcrafts+=1
                GlobalMsg['craft']  = gamePage.bld.getBuildingExt(craftPriority[0])._metaCache.label + ' (' + (gamePage.bld.getBuildingExt(craftPriority[0]).meta.val+1) + ')' + ': ' + (201 - cntcrafts)
            }


            if (cntcrafts > 200) {
                cntcrafts = 0
            }

            if (gamePage.science.get("construction").researched && gamePage.tabs[3].visible ) {
                for (var g = 0; g < resourcesAll.length; g++) {
                    if (resourcesAll[g][0] in reslist) {
                        if (Math.max(resourcesAll[g][2], gamePage.resPool.get(resourcesAll[g][0]).value) < reslist[resourcesAll[g][0]]){
                            resourcesAll[g][2] = reslist[resourcesAll[g][0]]
                            resourcesAll[g][4] =  true
                        }
                        resourcesAll[g][3] =  false

                    }else{
                        for (var z = 0; z < resourcesAll[g][1].length; z++) {
                            if (resourcesAll[g][1][z][0] in reslist && (gamePage.resPool.get((resourcesAll[g][1][z][0]).maxValue > 0 && gamePage.resPool.get(resourcesAll[g][1][z][0]).value < gamePage.resPool.get(resourcesAll[g][1][z][0]).maxValue) || gamePage.resPool.get(resourcesAll[g][1][z][0]).value < reslist[resourcesAll[g][1][z][0]] * 2)  && !["plate", "ship", "eludium", "alloy"].includes(resourcesAll[g][0])) {
                                resourcesAll[g][3] =  false
                                resourcesAll[g][4] =  false
                            }
                        }
                    }
                }


                //priority upgrades
                if (gamePage.resPool.get('ship').value > 0) {
                    let found = false;
                    for (var pru = 0; pru < upgrades_craft.length; pru++)  {
                        if (upgrades_craft[pru][0].researched ) {
                            upgrades_craft.splice(pru,1);
                            break;
                        }
                        if (upgrades_craft[pru][0].unlocked ){
                            for (var j = 0; j < upgrades_craft[pru][1].length; j++) {
                                if (gamePage.resPool.get(upgrades_craft[pru][1][j][0]).value >= upgrades_craft[pru][1][j][1]*1.2){
                                    continue;
                                }

                                for (var g = 0; g < resourcesAll.length; g++) {
                                    if (resourcesAll[g][0] == upgrades_craft[pru][1][j][0]) {
                                        if (Math.max(resourcesAll[g][2], gamePage.resPool.get(resourcesAll[g][0]).value) < upgrades_craft[pru][1][j][1]){
                                            resourcesAll[g][2] =  upgrades_craft[pru][1][j][1]
                                            resourcesAll[g][4] =  true
                                        }
                                        resourcesAll[g][3] =  false
                                    }
                                }
                                let respack = resourcesAll.filter(res => res[0] == upgrades_craft[pru][1][j][0])[0][1]
                                reslist = []
                                for (var g = 0; g < respack.length; g++) {
                                    reslist[reslist.length] = respack[g][0]
                                }

                                for (var g = 0; g < resourcesAll.length; g++) {
                                     for (var b = 0; b < resourcesAll[g][1].length; b++) {
                                        if ( (resourcesAll[g][0] != upgrades_craft[pru][1][j][0] && reslist.indexOf(resourcesAll[g][1][b][0]) > 0) || resourcesAll[g][1][b][0] == upgrades_craft[pru][1][j][0]) {
                                            if (gamePage.resPool.get(upgrades_craft[pru][1][j][0]).value < upgrades_craft[pru][1][j][1] ) {
                                                resourcesAll[g][4] =  false
                                            }
                                        }
                                     }
                                }
                            }
                            if (Object.keys(craftPriority[0]).length > 0) {
                                GlobalMsg['tech']  = upgrades_craft[pru][0].label
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        GlobalMsg['tech'] = '';
                    }
                }


                var resourcesAllF = resourcesAll.filter(res => res[4] && gamePage.workshop.getCraft(res[0]).unlocked ).sort(function(a, b) {
                    return (gamePage.resPool.get(a[0]).value - gamePage.resPool.get(b[0]).value);
                });


                for (var crf = 0; crf < resourcesAllF.length; crf++) {
                    var curResTarget = gamePage.resPool.get(resourcesAllF[crf][0]);
                    if (gamePage.workshop.getCraft(resourcesAllF[crf][0]).unlocked && resourcesAllF[crf][4]) {
                         flag = true;
                         cnt = 0;
                         if (curResTarget.value <= resourcesAllF[crf][2]) {
                            if (gamePage.resPool.get(resourcesAllF[crf][1][0][0]).value >= resourcesAllF[crf][1][0][1]) {
                                if (gamePage.ironWill && resourcesAllF[crf][0] == "slab" && gamePage.bld.getBuildingExt("mint").meta.val == 0 ) {
                                     for (var x = 0; x < resourcesAllF[crf][1].length; x++) {
                                        cnt = Math.min(cnt != 0 ? cnt : Math.floor((gamePage.resPool.get(resourcesAllF[crf][1][x][0]).value / resourcesAllF[crf][1][x][1])/10),Math.floor((gamePage.resPool.get(resourcesAllF[crf][1][x][0]).value / resourcesAllF[crf][1][x][1])/10), Math.floor(resourcesAllF[crf][2]) - curResTarget.value) + 1;
                                    }
                                }
                                else {
                                     for (var x = 0; x < resourcesAllF[crf][1].length; x++) {
                                        if (cnt == 0){
                                           cnt = Math.floor((gamePage.resPool.get(resourcesAllF[crf][1][x][0]).value / resourcesAllF[crf][1][x][1]))
                                        }
                                        cnt = Math.min(cnt, Math.floor((gamePage.resPool.get(resourcesAllF[crf][1][x][0]).value / resourcesAllF[crf][1][x][1])))
                                     }
                                 }
                            }

                         }
                         else{
                                 for (var x = 0; x < resourcesAllF[crf][1].length; x++) {
                                        tmpvalue =  gamePage.resPool.get(resourcesAllF[crf][1][x][0]).value
                                        tmpvalueMax =  gamePage.resPool.get(resourcesAllF[crf][1][x][0]).maxValue

                                        if ((tmpvalue < resourcesAllF[crf][1][x][1]) || (tmpvalueMax == 0 && curResTarget.value*2 > tmpvalue)) {
                                            flag = false;
                                        }
                                        else if (tmpvalueMax != 0 && (((gamePage.resPool.get('paragon').value < 100 && !(gamePage.religion.getRU('solarRevolution').val == 1) ) &&  Object.keys(craftPriority[0]).length > 0 && resourcesAllF[crf][1].filter(ff2 => craftPriority[3].indexOf(ff2[0]) != -1 ).length != 0 ) || (curResTarget.value < tmpvalue && tmpvalue/tmpvalueMax < 0.3) || (curResTarget.value >= tmpvalue && tmpvalue/tmpvalueMax <= 1))) {
                                            flag = false;
                                        }

                                        if (flag && ((cnt > (tmpvalue / resourcesAllF[crf][1][x][1])) || (cnt == 0))) {
                                            cnt = cnt == 0 ? 1 : cnt
                                            if (resourcesAllF[crf][0] == "eludium") {
                                                if (gamePage.resPool.get("unobtainium").value > gamePage.resPool.get("unobtainium").maxValue * 0.9){
                                                    cnt = Math.ceil(tmpvalue / resourcesAllF[crf][1][x][1]/2);
                                                }
                                                else{
                                                    cnt = 0;
                                                }
                                            }
                                        }
                                 }
                         }

                         if (flag == true && cnt > 0) {
                            if (resourcesAllF[crf][0] == "ship") {
                                if (gamePage.resPool.get("ship").value < 100 || (gamePage.resPool.get("ship").value < 5000 && gamePage.workshop.get("geodesy").researched) || gamePage.resPool.get("starchart").value > 1500){
                                    gamePage.craft(resourcesAllF[crf][0], cnt);
                                }
                            }
                            else if (resourcesAllF[crf][0] == "kerosene") {
                                if (gamePage.resPool.get("oil").value >= gamePage.resPool.get("oil").maxValue * 0.9 || (gamePage.resPool.get("kerosene").value < 50000  && gamePage.resPool.get("oil").value > 1000000)){
                                    gamePage.craft(resourcesAllF[crf][0], cnt);
                                }
                            }
                            else {
                               gamePage.craft(resourcesAllF[crf][0], cnt);
                            }
                         }
                    }
                }
                for (var crft = 0; crft < resources.length; crft++) {
                    var curRes = gamePage.resPool.get(resources[crft][0]);
                    var craftPrices = gamePage.workshop.getCraft(resources[crft][1]).prices;
                    var priceObj = craftPrices ? craftPrices.find(el => el.name == resources[crft][0]) : null;
                    if (priceObj && curRes.value >= priceObj.val) {
                        var resourcePerTick = gamePage.getResourcePerTick(resources[crft][0], 0);
                        var resourcePerCraft = Math.max(Math.min((resourcePerTick * 5),curRes.value), 1);
                        var resourcePerCraftTrade = Math.max(Math.min((resourcePerTick * 100),curRes.value), 1);
                        if (Object.keys(craftPriority[0]).length > 0  && craftPriority[3].indexOf(resources[crft][0]) != -1 ) {
                            if (curRes.maxValue > 0 && curRes.value >= curRes.maxValue && gamePage.workshop.getCraft(resources[crft][1]).unlocked) {
                                gamePage.craft(resources[crft][1], Math.floor((resourcePerCraftTrade / resources[crft][2])));
                            }
                            else if (curRes.maxValue == 0 && curRes.value > gamePage.resPool.get(resources[crft][1]).value && gamePage.workshop.getCraft(resources[crft][1]).unlocked) {
                                gamePage.craft(resources[crft][1], Math.floor((resourcePerCraftTrade / resources[crft][2])));
                            }
                        }
                        else if (curRes.maxValue > 0 && curRes.value > (curRes.maxValue - resourcePerCraft) && gamePage.workshop.getCraft(resources[crft][1]).unlocked) {
                            gamePage.craft(resources[crft][1], Math.floor((resourcePerCraftTrade / resources[crft][2])));
                        }
                        else if (curRes.maxValue == 0 && curRes.value > gamePage.resPool.get(resources[crft][1]).value && gamePage.workshop.getCraft(resources[crft][1]).unlocked) {
                            gamePage.craft(resources[crft][1], Math.floor((resourcePerCraftTrade / resources[crft][2])));
                        }
                    }
                }
            }
//	    }
}


// Auto Research
function autoResearch() {
    if (gamePage.tabs[2].visible) {
        gamePage.tabs[2].update();
        GlobalMsg['science'] = ''
        if (science_labels.length > 0){
            for (var sc = 0; sc < science_labels.length; sc++) {
                if (gamePage.science.get(science_labels[sc]).unlocked && !gamePage.science.get(science_labels[sc]).researched){
                    GlobalMsg['science'] = gamePage.science.get(science_labels[sc]).label
                    sciencePriority = [gamePage.science.get(science_labels[sc]).label, gamePage.science.get(science_labels[sc]).prices]
                    break;
                } else if (gamePage.science.get(science_labels[sc]).researched){
                    science_labels.splice(sc, 1);
                    sciencePriority = [null,[]];
                    break;
                }
            }
        }
        var btn = gamePage.tabs[2].buttons.filter(res => res.model.metadata.unlocked && res.model.enabled && !res.model.metadata.researched);
        for (var rsc = 0; rsc < btn.length; rsc++) {
            if ((gamePage.ironWill && !['astronomy','theology'].includes(btn[rsc].model.metadata.name)) && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked ) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked)))
               {}
            else{
                try {
                    var result = btn[rsc].controller.buyItem(btn[rsc].model, {});
                    if (result && result.itemBought) {
                        btn[rsc].update();
                        gamePage.msg('Science researched: ' + extractButtonNames(btn[rsc].model.name));
                    }
                } catch(err) {
                    console.log(err);
                }
            }
        }
        //policy
        if (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.resPool.get("culture").value >= 2000){
            var policy_lst = !gamePage.challenges.isActive("postApocalypse") ? policy_lst_all : policy_lst_post_apocalypse
            var policy_btns = gamePage.tabs[2].policyPanel.children.filter(res => res.model.metadata.unlocked && res.model.enabled && !res.model.metadata.researched)
            for (var rsc = 0; rsc < policy_btns.length; rsc++) {
                if (policy_lst.includes(policy_btns[rsc].id)){
                    try {
                        pr_no_confirm = gamePage.opts.noConfirm;
                        gamePage.opts.noConfirm = true;
                        var result = policy_btns[rsc].controller.buyItem(policy_btns[rsc].model, {});
                        if (result && result.itemBought) {
                                policy_btns[rsc].update();
                                gamePage.msg('Policy researched: ' + extractButtonNames(policy_btns[rsc].model.name ));
                                return;
                            }
                        gamePage.opts.noConfirm = pr_no_confirm;
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
         let ignores = ["biofuel", "invisibleBlackHand"];
         let check_str = (str, checklist) => checklist.some((s) => str.includes(s));
         if (gamePage.ironWill && !gamePage.workshop.get("seti").researched) {
            let IWignores = ['register', 'Hoes', 'Axe', 'Drill', 'Huts', 'geodesy', 'augumentation', 'astrophysicists', 'logistics', 'Engineers', 'internet', 'neuralNetworks', 'Robotic', 'Optimization' , 'assistance'];
            var btn = gamePage.tabs[3].buttons.filter(res => res.model.metadata.unlocked && !res.model.metadata.researched && !check_str(res.id, ignores) && !check_str(res.id, IWignores));
         }else{
            var btn = gamePage.tabs[3].buttons.filter(res => res.model.metadata.unlocked && !res.model.metadata.researched && !check_str(res.id, ignores));
         }
         for (var wrs = 0; wrs < btn.length; wrs++) {
            if (gamePage.ironWill && ((!gamePage.science.get('astronomy').researched && gamePage.science.get('astronomy').unlocked) || (!gamePage.science.get('theology').researched && gamePage.science.get('theology').unlocked  && gamePage.workshop.get("goldOre").researched && gamePage.workshop.get("goldOre").unlocked)))
            {}
            else if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && !['relicStation','voidAspiration'].includes(btn[wrs].model.metadata.name) && btn[wrs].model.prices.filter(res => res.name == 'antimatter').length > 0)
            {}
            else{
                try {
                    var result = btn[wrs].controller.buyItem(btn[wrs].model, {});
                        if (result && result.itemBought) {
                            btn[wrs].update();
                            gamePage.msg('Upgraded: ' + extractButtonNames(btn[wrs].model.name ));
                            return;
                        }
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
		var catpowerP = gamePage.resPool.get('manpower').value;
		var culture = gamePage.resPool.get('culture').value;
		var parchment = gamePage.resPool.get('parchment').value;
		var tclvl = Math.max(gamePage.religion.transcendenceTier,1);

		if (catpowerP > 1500 && culture > 5000 && parchment > 2500) {
		    if (gamePage.prestige.getPerk("carnivals").researched){
                if (gamePage.calendar.festivalDays < 400*30) {
                    if(catpowerP > 1500 * tclvl && culture > 5000 * tclvl && parchment > 2500 * tclvl){
                        gamePage.village.holdFestival(tclvl);
                        gamePage.resPool.addResEvent("manpower", -1500 * tclvl);
                        gamePage.resPool.addResEvent("culture", -5000 * tclvl);
                        gamePage.resPool.addResEvent("parchment", -2500 * tclvl);
                    }
                    else{
                        gamePage.village.holdFestival(1);
                        gamePage.resPool.addResEvent("manpower", -1500 * 1);
                        gamePage.resPool.addResEvent("culture", -5000 * 1);
                        gamePage.resPool.addResEvent("parchment", -2500 * 1);
                    }
                }
			}
			else if (gamePage.calendar.festivalDays == 0 && catpowerP > gamePage.resPool.get('manpower').maxValue * 0.5) {
			    gamePage.village.holdFestival(1);
			    gamePage.resPool.addResEvent("manpower", -1500 * 1);
                gamePage.resPool.addResEvent("culture", -5000 * 1);
                gamePage.resPool.addResEvent("parchment", -2500 * 1);
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
            var btn = gamePage.tabs[0].children.filter(res =>  res.model.metadata && res.model.metadata.unlocked && res.model.metadata.name == 'unicornPasture');

            if (btn.length > 0 &&  ((btn[0].model.prices.filter(res => res.name == "unicorns")[0].val - gamePage.resPool.get('unicorns').value) / (gamePage.getResourcePerTick('unicorns', true) * gamePage.getTicksPerSecondUI()))/60 > 0.1){
                if(gamePage.religionTab.sacrificeBtn.model.allLink.visible){
                    gamePage.religionTab.sacrificeBtn.controller.transform(gamePage.religionTab.sacrificeBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
                }
            }
        }

        if (gamePage.resPool.get('alicorn').value > 25 && (switches['CollectResBReset'] || gamePage.resPool.get('alicorn').value > gamePage.resPool.get("timeCrystal").value || (gamePage.time.meta[0].meta[6].unlocked && gamePage.resPool.get("timeCrystal").value > gamePage.timeTab.cfPanel.children[0].children[8].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.timeTab.cfPanel.children[0].children[8].model.metadata.val > 2 ? 0.9 : 0.05)))) {
            if (gamePage.religionTab.sacrificeAlicornsBtn.model.allLink.visible){
                gamePage.religionTab.sacrificeAlicornsBtn.controller.transform(gamePage.religionTab.sacrificeAlicornsBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
            }
        }
        if (!switches['CollectResBReset']) {
            if (!gamePage.workshop.get("relicStation").researched && (!gamePage.workshop.get("chronoforge").researched || gamePage.religion.getTU("blackNexus").on > 5) && (gamePage.resPool.get('relic').value  < (gamePage.challenges.isActive("energy") ? 25 : 5) && gamePage.resPool.get('timeCrystal').value > 50)) {
                if (gamePage.religionTab.refineTCBtn && gamePage.religionTab.refineTCBtn.model.visible){
                    var result = gamePage.religionTab.refineTCBtn.controller.buyItem(gamePage.religionTab.refineTCBtn.model, {});
                    if (result && result.itemBought) {
                         gamePage.religionTab.refineTCBtn.update();
                    }
                }
            } else if (gamePage.calendar.year > 1000 && (gamePage.resPool.get('relic').value + (gamePage.resPool.get("blackcoin").value * 1000)) < (gamePage.resPool.get('timeCrystal').value / 25 * (1 + gamePage.getEffect("relicRefineRatio") * gamePage.religion.getZU("blackPyramid").getEffectiveValue(gamePage)))  && (gamePage.resPool.get('timeCrystal').value > 1000000 && GlobalMsg["ressourceRetrieval"] == '')) {
                if(gamePage.religionTab.refineTCBtn && gamePage.religionTab.refineTCBtn.model.allLink.visible){
                    gamePage.religionTab.refineTCBtn.controller.transform(gamePage.religionTab.refineTCBtn.model, 1, {}, function(result) {
                                                if (result) {
                                                }})
                }
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

             for (var zg = 0; zg < btn.length; zg++) {
                btn[zg].controller.updateEnabled(btn[zg].model);
             }

            if (btn.length < 2 || (btn.length > 0 && btn[btn.length - 1].model.enabled) || (gamePage.religionTab.zgUpgradeButtons[0].model.prices.filter(res => res.name == "tears")[0].val < gamePage.resPool.get('tears').value * 0.05 && gamePage.religionTab.zgUpgradeButtons[0].model.prices.filter(res => res.name == "ivory")[0].val < gamePage.resPool.get('ivory').value * 0.05) || (gamePage.religionTab.zgUpgradeButtons[6].model.prices.filter(res => res.name == "tears")[0].val < gamePage.resPool.get('tears').value * 0.1 && gamePage.religionTab.zgUpgradeButtons[6].model.prices.filter(res => res.name == "unobtainium")[0].val < gamePage.resPool.get('unobtainium').value) ) {
                for (var zg = btn.length - 1; zg >= 0; zg--) {
                    if (btn[zg] && btn[zg].model.metadata.unlocked && (!btn[zg].model.prices.filter(res => res.name == "unobtainium")[0] || btn[zg].model.prices.filter(res => res.name == "unobtainium")[0].val < (gamePage.resPool.get('unobtainium').value - (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 ?  Chronosphere10SummPrices()["unobtainium"] : 0)) )) {
                        if (btn[zg].model.metadata.name == "unicornGraveyard" && gamePage.religionTab.zgUpgradeButtons[7].model.on > 0 && (gamePage.religionTab.zgUpgradeButtons[8].model.prices.filter(res => res.name == "necrocorn")[0].val < 200 || gamePage.diplomacy.get("leviathans").energy < gamePage.diplomacy.getMarkerCap()))
                            {}
                        else{
                            try {
                                var result = btn[zg].controller.buyItem(btn[zg].model, {});
                                if (result && result.itemBought) {
                                    btn[zg].update();
                                    gamePage.msg('Build in Ziggurats: ' +  extractButtonNames(btn[zg].model.name ));
                                    if (zg == btn.length - 1 && btn[btn.length - 1].model.enabled) {
                                        zg++
                                    }
                                }
                            } catch(err) {
                            console.log(err);
                            }
                        }
                    }
                }
            }
        }

        if ( gamePage.resPool.get('sorrow').value < gamePage.resPool.get('sorrow').maxValue &&  gamePage.resPool.get('sorrow').value * 10000 < gamePage.resPool.get('tears').value ){
            var btn = [gamePage.religionTab.refineBtn]
            for (var zg = 0; zg < btn.length; zg++) {
                if (btn[zg] && btn[zg].model.visible == true) {
                    try {
                         var result = btn[zg].controller.buyItem(btn[zg].model, {});
                         if (result && result.itemBought) {
                            gamePage.msg('Refine tears: BLS(' + Math.trunc(gamePage.resPool.get('sorrow').value)  + ')');
                         }
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
        var resourcesAssign = {
       		"catnip": (gamePage.challenges.isActive("winterIsComing") && (gamePage.bld.getBuildingExt('aqueduct').meta.val < 10 && gamePage.resPool.get("catnip").value < gamePage.village.getKittens() * 100)) ? ["catnip", "farmer", 0.001, 0.001] : ((gamePage.village.getKittens() > 2  ||  gamePage.workshop.get("mineralHoes").researched ) ? ["catnip", "farmer", gamePage.resPool.get("catnip").value < gamePage.resPool.get("catnip").maxValue * 0.1 ? 9 : 999, (gamePage.resPool.get('paragon').value < 200 && gamePage.bld.getBuildingExt('temple').meta.val < 1 && gamePage.village.getKittens() > 2) ? 0.1 : 1] : ["wood","woodcutter", 1, 1]),
        	"wood, beam": ["wood","woodcutter",(gamePage.resPool.get("beam").value < gamePage.resPool.get("slab").value && gamePage.resPool.get("beam").value < gamePage.resPool.get("wood").value) ?  Math.max(0.1, gamePage.resPool.get("wood").value/gamePage.resPool.get("wood").maxValue) : gamePage.resPool.get("beam").value > gamePage.resPool.get("wood").maxValue ?  Math.max(0.1, gamePage.resPool.get("beam").value/gamePage.resPool.get("wood").maxValue / ((gamePage.resPool.get("wood").maxValue / ((gamePage.getResourcePerTick("wood", 0) * 5) / gamePage.village.getJob('woodcutter').value)) / gamePage.village.getJob('woodcutter').value / gamePage.village.getJob('woodcutter').value))  : 1 , 2],
        	"minerals, slab": ["minerals","miner",(gamePage.resPool.get("slab").value < gamePage.resPool.get("beam").value && gamePage.resPool.get("slab").value < gamePage.resPool.get("minerals").value) ?  Math.max(0.1, gamePage.resPool.get("minerals").value/gamePage.resPool.get("minerals").maxValue) :  gamePage.resPool.get("slab").value > gamePage.resPool.get("minerals").maxValue ?  Math.max(0.1, gamePage.resPool.get("slab").value/gamePage.resPool.get("minerals").maxValue / ((gamePage.resPool.get("minerals").maxValue / ((gamePage.getResourcePerTick("minerals", 0) * 5) / gamePage.village.getJob('miner').value)) / gamePage.village.getJob('miner').value / gamePage.village.getJob('miner').value)) : 1 , (gamePage.resPool.get("minerals").value < 275 && gamePage.challenges.isActive("winterIsComing")) ? 0.01 : 2],
            "science": ["science", "scholar",(gamePage.resPool.get("science").value < gamePage.resPool.get("science").maxValue * 0.5) ? 0.5 : 1, (gamePage.science.get('engineering').researched  && gamePage.resPool.get("science").value > 100) ? 1 : (gamePage.village.getKittens() > 1 ? 0.1 : 0.001)],
        	"manpower, parchment": ["manpower", "hunter", 0.1 , (gamePage.workshopTab.visible && gamePage.resPool.get("parchment").value < 200) ? 0.2 : 1],
            "faith": ["faith", "priest", gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.resourceIsLimited == false && (!(res.model.name.includes('(complete)'))) && (!(res.model.name.includes('(Transcend)')))).length  == 0 ?  (gamePage.religion.getSolarRevolutionRatio() <= Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")) ? 0.1 : 2) :  (gamePage.religion.getSolarRevolutionRatio() <= Math.max(gamePage.religion.transcendenceTier * 0.05, gamePage.getEffect("solarRevolutionLimit")) ? 1 : gamePage.resPool.get("faith").value/gamePage.resPool.get("faith").maxValue * 10 + 1 ) , (gamePage.resPool.get("faith").value < 750 && gamePage.resPool.get("gold").maxValue >= 500 ) ? 0.01 : 5],
            "coal, gold": (gamePage.resPool.get("coal").value / gamePage.resPool.get("coal").maxValue  || 100) < (gamePage.workshop.get("geodesy").researched ? gamePage.resPool.get("gold").value / gamePage.resPool.get("gold").maxValue : 100) ? ["coal", "geologist",gamePage.resPool.get("coal").value < gamePage.resPool.get("coal").maxValue * 0.99 ? 1 : 15,15] : ["gold", "geologist",gamePage.resPool.get("gold").value < gamePage.resPool.get("gold").maxValue * 0.99 ? 1 : 15,15]
                };


        if(Object.keys(craftPriority[0]).length > 0){
            let tstres = ["wood", "minerals", "beam", "slab", "science", "faith", "gold", "coal", "manpower", "parchment"].filter(x => gamePage.bld.getPrices(craftPriority[0]).some(elem => elem.name === x));
            if (tstres.length > 0) {
                tstres.forEach(function(entry) {
                    const priceObj = gamePage.bld.getPrices(craftPriority[0]).find(el => el.name == entry);
                    if (gamePage.resPool.get(entry).value < (priceObj ? priceObj.val : 0)) {
                        res_elem = Object.entries(resourcesAssign).map(([k,v]) => k).find( k => k.indexOf(entry) > -1);
                        resourcesAssign[res_elem][2] = 0.1;
                        resourcesAssign[res_elem][3] = 0.1;
                    }
                });
            }
        }

        resourcesAssign = Object.entries(resourcesAssign).map(([k,v]) => v);
	    let restmp = resourcesAssign.filter(res => res[0] in gamePage.village.getJob(res[1]).modifiers &&  gamePage.village.getJob(res[1]).unlocked && ( !gamePage.challenges.isActive("atheism") || res[0] != 'faith'));
	    restmpq = restmp.sort(function(a, b) {
	            if (gamePage.resPool.get(a[0]).value >= gamePage.resPool.get(a[0]).maxValue){
	                atick = gamePage.resPool.get(a[0]).maxValue * 10;
	                ajobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? a[2] : a[3];
	            }
	            else{
	                atick = gamePage.calcResourcePerTick(a[0]) + 1;
	                ajobs = gamePage.village.getJob(a[1]).value + 1;
	            }
	            if (gamePage.resPool.get(b[0]).value >= gamePage.resPool.get(b[0]).maxValue){
	                btick = gamePage.resPool.get(b[0]).maxValue * 10;
	                bjobs = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? b[2] : b[3];
	            }
	            else{
	                btick = gamePage.calcResourcePerTick(b[0]) + 1;
	                bjobs = gamePage.village.getJob(b[1]).value + 1;
	            }
	            kfa = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? a[2] : a[3];
	            kfb = (gamePage.religion.getRU('solarRevolution').val == 1 || gamePage.challenges.isActive("atheism")) ? b[2] : b[3];
	            return (((atick / gamePage.resPool.get(a[0]).maxValue) * (gamePage.resPool.get(a[0]).value / gamePage.resPool.get(a[0]).maxValue) * (kfa * ajobs) ) * kfa - ((btick / gamePage.resPool.get(b[0]).maxValue) * (gamePage.resPool.get(b[0]).value / gamePage.resPool.get(b[0]).maxValue) * (kfb * bjobs)) * kfb);

        });

        kittens_cnt = gamePage.village.getKittens()
        if (game.village.getFreeKittens() != 0 ) {
            gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),1);
        }else if (kittens_cnt > 0) {
            restmpdel = restmpq.filter(res => gamePage.village.getJob(res[1]).value > ((gamePage.resPool.get(res[0]).value >= gamePage.resPool.get(res[0]).maxValue) ? 1 : kittens_cnt/2/7));
            if (restmpdel.length > 0){
                let cnt = Math.max(Math.floor(gamePage.village.getJob(restmpdel[restmpdel.length - 1][1]).value * 0.1),1)
                if (cnt > 0) {
                    gamePage.village.sim.removeJob(restmpdel[restmpdel.length - 1][1],cnt);
                    gamePage.village.assignJob(gamePage.village.getJob(restmpq[0][1]),cnt);
                }

            }
        }
        if (gamePage.science.get('civil').researched && !gamePage.ironWill && gamePage.resPool.get("gold").value > 1000){
            if (IincKAssign > 10) {
                  let prkitten = gamePage.village.sim.kittens.filter(kitten => kitten.job == restmpq[0][1]).sort(function(a, b) {return  b.skills[restmpq[0][1]] - a.skills[restmpq[0][1]];})[0]
                  if (prkitten){
                      gamePage.village.makeLeader(prkitten);
                      if (gamePage.village.sim.expToPromote(prkitten.rank, prkitten.rank+1, prkitten.exp)[0] && gamePage.village.sim.goldToPromote(prkitten.rank, prkitten.rank+1, gamePage.resPool.get("gold").value)[1] < gamePage.resPool.get("gold").value * 0.3) {
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
                [gamePage.challenges.isActive("postApocalypse") ? null : bldSmelter,0.09,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'smelter')],
                [gamePage.challenges.isActive("postApocalypse") ? null : bldOilWell, (gamePage.bld.getBuildingExt('library').meta.stage == 1 && gamePage.bld.getBuildingExt('biolab').meta.on != gamePage.bld.getBuildingExt('biolab').meta.val) ? 9999 :  0.3 ,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "oilWell")],
                [bldBioLab,(gamePage.science.get('antimatter').researched && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue*0.2) ? 0.3 : Math.max(0.2,gamePage.calcResourcePerTick('oil') * 5 / gamePage.resPool.get('oil').maxValue * 100 * (gamePage.resPool.get("oil").value / gamePage.resPool.get("oil").maxValue))* (gamePage.space.meta[3].meta[1].val +1),gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "biolab")],
                (gamePage.ironWill && Math.min(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)), Math.floor(gamePage.resPool.get('minerals').value / 1000)) < gamePage.bld.getBuildingExt('calciner').meta.val ) ? [gamePage.challenges.isActive("postApocalypse") ? null : bldSmelter,0.09,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'smelter')] : [gamePage.challenges.isActive("postApocalypse") ? null : bldCalciner,0.101,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "calciner")],
                [bldAccelerator,0.09,gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "accelerator")],
                [gamePage.tabs[6].planetPanels[4] ? spcContChamber : null, (gamePage.science.get('antimatter').researched && gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue*0.9 && gamePage.space.meta[5].meta[1].val > 1) ? Math.max(0.05, (1 - gamePage.resPool.get("antimatter").value/gamePage.resPool.get("antimatter").maxValue )/10): 9999,gamePage.tabs[6].planetPanels[4] ? gamePage.tabs[6].planetPanels[4].children[1] : null] ,
                [gamePage.tabs[6].planetPanels[1] ? spcMoonBase: null, 0.2, gamePage.tabs[6].planetPanels[1] ? gamePage.tabs[6].planetPanels[1].children[1]: null],
                [gamePage.tabs[6].planetPanels[0] ? spcSpaceStation: null, 0.09, gamePage.tabs[6].planetPanels[0]  ? gamePage.tabs[6].planetPanels[0].children[2]: null],
                [bldFactory, 0.01, gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == "factory")],
                [gamePage.tabs[6].planetPanels[1] ? (gamePage.resPool.get('uranium').value > 1000 ? spcLunarOutpost: null) : null, 0.01, gamePage.tabs[6].planetPanels[1]  ? (gamePage.resPool.get('uranium').value > 1000 ? gamePage.tabs[6].planetPanels[1].children[0] : null): null],
                [gamePage.tabs[6].planetPanels[3] ? spcOrbitalArray : null, 0.01, gamePage.tabs[6].planetPanels[3]  ? gamePage.tabs[6].planetPanels[3].children[1]: null],
                [gamePage.bld.getBuildingExt('warehouse').meta.stage == 0 ? null : bldWarehouse, 0.3, gamePage.tabs[0].children.find(o => o.model.metadata && o.model.metadata.name == 'warehouse')]
                 ];


            if (gamePage.science.get('antimatter') && gamePage.resPool.get("antimatter").value < gamePage.resPool.get("antimatter").maxValue*0.9 && gamePage.space.meta[5].meta[1].on > 1){
                gamePage.space.meta[5].meta[1].on = gamePage.space.meta[5].meta[1].on-1;
            }

            if (proVar>conVar) {
                EnergyInc = EnergyPriority.filter(res => res[0] && res[0].val > res[0].on && (proVar > (conVar + res[0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio() ) || (res[2].model.metadata.name == "containmentChamber" && gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue * 0.9 )  ) ).sort(function(a, b) {
                    return a[1] - b[1];
                });
                if (EnergyInc.length > 0){
                      EnergyInc[0][2].controller.on(EnergyInc[0][2].model,Math.min(Math.floor(FreeEnergy / (EnergyInc[0][0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio()) ), EnergyInc[0][0].val -  EnergyInc[0][0].on));
                }

            }
            else if (proVar<conVar) {
                EnergyDec = EnergyPriority.filter(res => res[0] && res[0].on > 1 && res[0].effects !== undefined && "energyConsumption" in res[0].effects && res[0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio() > 0 && proVar < conVar).sort(function (a, b) {
                    return b[1] - a[1];
                });
                if (EnergyDec.length > 0){
                    EnergyDec[0][2].controller.off(EnergyDec[0][2].model, Math.min(EnergyDec[0][0].on - 1, Math.min(Math.ceil(FreeEnergy / (EnergyDec[0][0].effects.energyConsumption * gamePage.resPool.getEnergyConsumptionRatio()) ), EnergyDec[0][0].on)));
                }
            }
        }
}

function autoNip() {
		if (gamePage.bld.buildingsData[0].val < 40 && gamePage.resPool.get('catnip').value < 100 && (gamePage.gatherClicks  < 2500 || gamePage.ironWill )) {
		    btn = gamePage.tabs[0].children[0];
			try {
				var result = btn.controller.buyItem(btn.model, {});
                if (result && result.itemBought) {
                    if (gamePage.timer.ticksTotal % 151 === 0){
                        gamePage.msg('Gathering catnip');
                    }
                }
			} catch(err) {
			console.log(err);
			}
		}
}
function autoRefine() {
    if ((gamePage.village.getKittens() < 14 || !gamePage.workshopTab.visible) && ((!gamePage.challenges.isActive("winterIsComing") || gamePage.bld.getBuildingExt('hut').meta.val == 0) && gamePage.bld.getBuildingExt('field').meta.unlocked && gamePage.resPool.get('catnip').value > gamePage.resPool.get('wood').value * 5  && gamePage.resPool.get('catnip').value > Math.min(gamePage.resPool.get('catnip').maxValue * 0.9, (gamePage.calendar.season >= 1 ? Math.max(gamePage.tabs[0].children[2].model.prices.filter(res => res.name == "catnip")[0].val * 2, 100) : 100)))) {
        if (!gamePage.workshopTab.visible ){

                    if (gamePage.tabs[0].children[1].model.x100Link.visible && gamePage.tabs[0].children[2].model.resourceIsLimited ){
                        gamePage.tabs[0].children[1].model.x100Link.handler(gamePage.tabs[0].children[1].model);
                    }
                    else if(gamePage.tabs[0].children[2] && gamePage.tabs[0].children[2].model.resourceIsLimited && gamePage.tabs[0].children[1].model.visible){
                        gamePage.tabs[0].children[1].controller.buyItem(gamePage.tabs[0].children[1].model, {})
                    }
                    else {
                        btn = gamePage.tabs[0].children[1];
                        price = gamePage.tabs[0].children[1].model.prices.filter(res => res.name == "catnip")[0].val;
                        limit = Math.ceil(Math.min(gamePage.resPool.get('wood').maxValue * 0.1 - gamePage.resPool.get('wood').value, Math.trunc(gamePage.resPool.get('catnip').value/price)-1));


                        for (var rf = 0; rf < limit; rf++) {
                            if (btn.model.enabled) {
                                 try {
                                       btn.controller.buyItem(btn.model, {});
                                     } catch(err) {
                                        console.log(err);
                                     }
                            }
                        }
                    }

        }
        else if(gamePage.tabs[0].children[1].model.x100Link && gamePage.ironWill && gamePage.resPool.get('wood').value < gamePage.resPool.get('wood').maxValue * 0.1) {
            if (gamePage.tabs[0].children[1].model.x100Link.visible){
                gamePage.tabs[0].children[1].model.x100Link.handler(gamePage.tabs[0].children[1].model);
            }
        }
    }
}

function upgradeByModel(target){
	var metadataRaw = target.controller.getMetadataRaw(target.model);
    metadataRaw.stage = metadataRaw.stage || 0;
    metadataRaw.stage++;

    metadataRaw.val = 0;
    metadataRaw.on = 0;
    if (metadataRaw.calculateEffects){
        metadataRaw.calculateEffects(metadataRaw, target.controller.game);
    }
    target.controller.game.upgrade(metadataRaw.upgrades);
    target.controller.game.render();
}

function UpgradeBuildings() {
    if (gamePage.diplomacy.hasUnlockedRaces()){
        gamePage.diplomacy.unlockRandomRace();
    }
    if (gamePage.bld.getBuildingExt('reactor').meta.unlocked && !gamePage.bld.getBuildingExt('reactor').meta.isAutomationEnabled && gamePage.bld.getBuildingExt('reactor').meta.val > 0 && gamePage.workshop.get("thoriumReactors").researched && gamePage.resPool.get('thorium').value > 10000 && gamePage.resPool.get('uranium').perTickCached > 250) {
        gamePage.bld.getBuildingExt('reactor').meta.isAutomationEnabled = true
    }

    var mblds = gamePage.bld.meta[0].meta.filter(res => res.stages && res.stages[1].stageUnlocked && res.stage == 0 && (res.name != "library" || (gamePage.space.getProgram("orbitalLaunch").val == 1 && !gamePage.challenges.isActive("energy") && gamePage.bld.getBuildingExt('aqueduct').meta.stage != 0)) && (res.name != "aqueduct" || (!gamePage.challenges.isActive("winterIsComing") && ((gamePage.resPool.get('paragon').value > 200 && gamePage.bld.getBuildingExt('accelerator').meta.val > 2) || (gamePage.resPool.get('paragon').value <= 200 && gamePage.space.getBuilding('hydroponics').val > 0) )) ) && (res.name != "warehouse" || (gamePage.resPool.get("eludium").value >= 200000 && gamePage.time.getCFU("ressourceRetrieval").val > 3)) );
    var upgradeTarget;
    for (var up = 0; up < mblds.length; up++) {
        upgradeTarget = gamePage.tabs[0].children.find(res => res.model.metadata && res.model.metadata.name == mblds[up].name);
        upgradeByModel(upgradeTarget);
    }

    if (!gamePage.challenges.isActive("postApocalypse") && gamePage.bld.getBuildingExt('steamworks').meta.on < gamePage.bld.getBuildingExt('steamworks').meta.val && gamePage.resPool.get('coal').value > 0 && gamePage.bld.getBuildingExt('steamworks').meta.unlocked) {
        gamePage.bld.getBuildingExt('steamworks').meta.on = gamePage.bld.getBuildingExt('steamworks').meta.val;
    }
    if (gamePage.bld.getBuildingExt('reactor').meta.on < gamePage.bld.getBuildingExt('reactor').meta.val && gamePage.resPool.get('uranium').value > 100 && gamePage.bld.getBuildingExt('reactor').meta.unlocked) {
        gamePage.bld.getBuildingExt('reactor').meta.on = gamePage.bld.getBuildingExt('reactor').meta.val;
    }
    if (!gamePage.challenges.isActive("postApocalypse")  && gamePage.bld.getBuildingExt('magneto').meta.on < gamePage.bld.getBuildingExt('magneto').meta.val && gamePage.resPool.get('oil').value > 0 && gamePage.bld.getBuildingExt('magneto').meta.unlocked) {
        gamePage.bld.getBuildingExt('magneto').meta.on = gamePage.bld.getBuildingExt('magneto').meta.val;
    }
    if (gamePage.space.getBuilding("moonOutpost").unlocked && !gamePage.challenges.isActive("energy")){
        if (gamePage.space.getBuilding("moonOutpost").on < gamePage.space.getBuilding("moonOutpost").val && gamePage.resPool.get('uranium').value > 1000 && gamePage.resPool.get('unobtainium').value < gamePage.resPool.get('unobtainium').maxValue){
            gamePage.space.getBuilding("moonOutpost").on = gamePage.space.getBuilding("moonOutpost").val
        }else if (gamePage.space.getBuilding("moonOutpost").on > 0 && (gamePage.resPool.get('uranium').value <= 1000 || gamePage.resPool.get('unobtainium').value >= gamePage.resPool.get('unobtainium').maxValue)){
            gamePage.space.getBuilding("moonOutpost").on--;
        }
    }
    if (gamePage.bld.getBuildingExt('smelter').meta.unlocked && (!gamePage.challenges.isActive("postApocalypse") || gamePage.village.getKittens() < 10)){
        if (((gamePage.ironWill && gamePage.diplomacy.get('nagas').unlocked && gamePage.resPool.get('gold').unlocked &&  gamePage.resPool.get('minerals').value / 100 > gamePage.bld.getBuildingExt('smelter').meta.on ) || (gamePage.ironWill && ((gamePage.workshop.get("goldOre").researched && gamePage.bld.getBuildingExt('amphitheatre').meta.val > 3) || gamePage.resPool.get('iron').value < 100 ))) || ((gamePage.calcResourcePerTick('wood') + gamePage.getResourcePerTickConvertion('wood') + gamePage.bld.getBuildingExt('smelter').meta.effects.woodPerTickCon +  gamePage.calcResourcePerTick('wood') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on  && ( gamePage.calcResourcePerTick('minerals') + gamePage.getResourcePerTickConvertion('minerals')  + gamePage.bld.getBuildingExt('smelter').meta.effects.mineralsPerTickCon + gamePage.calcResourcePerTick('minerals') * gamePage.prestige.getParagonProductionRatio()) * 5 > gamePage.bld.getBuildingExt('smelter').meta.on)) {
                if (gamePage.ironWill) {
                    if (gamePage.bld.getBuildingExt('smelter').meta.val >= gamePage.bld.getBuildingExt('smelter').meta.on){
                        gamePage.bld.getBuildingExt('smelter').meta.on= Math.min(Math.floor(gamePage.resPool.get('minerals').value / 100), gamePage.bld.getBuildingExt('smelter').meta.val);
                        gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.max(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)),1), Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
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
                    gamePage.bld.getBuildingExt('calciner').meta.on= Math.min(Math.max(Math.floor(gamePage.resPool.get('coal').value /(gamePage.resPool.get('coal').maxValue / gamePage.bld.getBuildingExt('calciner').meta.val)),1), Math.floor(gamePage.resPool.get('minerals').value / 1000), gamePage.bld.getBuildingExt('calciner').meta.val);
                }
                else {
                    gamePage.bld.getBuildingExt('smelter').meta.on= 0;
                }
            }
            else if (gamePage.religion.getRU('solarRevolution').val == 0){
                gamePage.bld.getBuildingExt('smelter').meta.on--;
            }
        }
    }
    if (gamePage.resPool.get('paragon').value < 200 && gamePage.resPool.get("unobtainium").value == 0 && gamePage.bld.getBuildingExt("mint").meta.val > 1 && gamePage.calendar.year < 2000){
        if (gamePage.resPool.get('manpower').value > gamePage.bld.getBuildingExt("mint").meta.on * (gamePage.resPool.get('manpower').maxValue / gamePage.bld.getBuildingExt("mint").meta.val) ){
            if (gamePage.bld.getBuildingExt("mint").meta.on < gamePage.bld.getBuildingExt("mint").meta.val){
                gamePage.bld.getBuildingExt('mint').meta.on++;
            }
        }
        else {
            if (gamePage.bld.getBuildingExt("mint").meta.on > 1){
                gamePage.bld.getBuildingExt('mint').meta.on--;
            }
        }
    } else if (gamePage.bld.getBuildingExt("mint").meta.on != gamePage.bld.getBuildingExt("mint").meta.val){
        gamePage.bld.getBuildingExt('mint').meta.on = gamePage.bld.getBuildingExt('mint').meta.val
    }

    if (gamePage.challenges.isActive("postApocalypse") && gamePage.time.getCFU("ressourceRetrieval").val > 0 && (gamePage.calendar.cycle != 5 || (gamePage.calendar.day <= 10 || gamePage.calendar.day >= 90))){
        gamePage.bld.getBuildingExt('mine').meta.on = 0;
        gamePage.bld.getBuildingExt('quarry').meta.on = 0;
        gamePage.bld.getBuildingExt('calciner').meta.on = 0;
        gamePage.bld.getBuildingExt('steamworks').meta.on = 0;
        gamePage.bld.getBuildingExt('magneto').meta.on = 0;
        gamePage.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = false;
        if (gamePage.workshop.get("geodesy").researched){
            gamePage.bld.getBuildingExt('smelter').meta.on = 0;
        }
        postApocalypse_is_competed = false;
    }
    if ((!postApocalypse_is_competed  && !gamePage.challenges.isActive("postApocalypse")) || (gamePage.challenges.isActive("postApocalypse")  && gamePage.time.getCFU("ressourceRetrieval").val > 0 && gamePage.calendar.cycle == 5 && gamePage.calendar.day > 10 && gamePage.calendar.day < 90)){
        gamePage.bld.getBuildingExt('mine').meta.on = gamePage.bld.getBuildingExt('mine').meta.val;
        gamePage.bld.getBuildingExt('quarry').meta.on =  gamePage.bld.getBuildingExt('quarry').meta.val;
        gamePage.bld.getBuildingExt('calciner').meta.on =  gamePage.bld.getBuildingExt('calciner').meta.val;
        gamePage.bld.getBuildingExt('smelter').meta.on =  gamePage.bld.getBuildingExt('smelter').meta.val;
        gamePage.bld.getBuildingExt('steamworks').meta.on =  gamePage.bld.getBuildingExt('steamworks').meta.val;
        gamePage.bld.getBuildingExt('magneto').meta.on = gamePage.bld.getBuildingExt('magneto').meta.val
        gamePage.bld.getBuildingExt('oilWell').meta.isAutomationEnabled = true;
        if (!postApocalypse_is_competed  && !gamePage.challenges.isActive("postApocalypse")){
            postApocalypse_is_competed = true;
        }
    }
}

function ResearchSolarRevolution() {
        GlobalMsg['solarRevolution'] = ''
        if (gamePage.religion.getRU('solarRevolution').val == 0 && !gamePage.challenges.isActive("atheism")){
            if (gamePage.science.get('theology').researched){
                GlobalMsg['solarRevolution'] =  gamePage.religion.getRU("solarRevolution").label
            }
            if (  gamePage.tabs[5].rUpgradeButtons.filter(res => res.model.metadata.name == "solarRevolution" && res.model.visible &&  res.model.enabled && res.model.resourceIsLimited == false).length > 0){
                    var btn = gamePage.tabs[5].rUpgradeButtons[5];
                    try {
                        var result = btn.controller.buyItem(btn.model, {});
                        if (result && result.itemBought) {
                            btn.update();
                            gamePage.msg('Religion researched: ' + extractButtonNames(btn.model.name));
                        }
                    } catch(err) {
                        console.log(err);
                    }
            }
	    }
}

function Timepage() {
        GlobalMsg['relicStation'] = ''
        GlobalMsg['voidAspiration'] = ''
        if (gamePage.science.get('voidSpace').researched || gamePage.workshop.get("chronoforge").researched ){
            gamePage.timeTab.update();
        }
        if (gamePage.science.get('voidSpace').researched){
            var VoidBuild = gamePage.timeTab.vsPanel.children[0].children;
            var voidcf = gamePage.religion.getZU("marker").val > 1 ? Math.max(Math.min(VoidBuild[3].model.prices.filter(res => res.name == "void")[0].val,VoidBuild[5].model.prices.filter(res => res.name == "void")[0].val),gamePage.resPool.get("void").value) : Math.min(VoidBuild[3].model.prices.filter(res => res.name == "void")[0].val,VoidBuild[5].model.prices.filter(res => res.name == "void")[0].val)
            if (gamePage.workshop.get("turnSmoothly").researched && !gamePage.ironWill) {
                if (VoidBuild[0].model.visible) {
                    if ( Math.max(500, VoidBuild[2].model.on * 20) > voidcf * 0.1){
                        {}
                    }else {
                        var result = VoidBuild[0].controller.buyItem(VoidBuild[0].model, {});
                        if (result && result.itemBought) {
                            gamePage.msg('Cryochamber Fixed');
                        }
                    }
                }

                if (VoidBuild[1].model.visible) {
                    if ( VoidBuild[1].model.prices.filter(res => res.name == 'void')[0].val > voidcf * 0.1 ||  VoidBuild[1].model.metadata.val >= Math.max(Math.ceil((VoidBuild[2].model.metadata.val+1) * 0.1), 5) ){
                        {}
                    }else {
                        var result = VoidBuild[1].controller.buyItem(VoidBuild[1].model, {});
                        if (result && result.itemBought) {
                            VoidBuild[1].update();
                            gamePage.msg('Build in Time: ' + extractButtonNames(VoidBuild[1].model.name ));
                        }
                    }
                }
            }


			try {
				for (var v = 3 ;v < VoidBuild.length; v++) {
					if (VoidBuild[v].model.metadata.unlocked && VoidBuild[v].model.enabled) {

					    if (!switches['CollectResBReset'] ) {
                            if (gamePage.workshop.get("voidAspiration").unlocked && !gamePage.workshop.get("voidAspiration").researched){
                                {
                                    GlobalMsg['voidAspiration'] = gamePage.workshop.get("voidAspiration").label
                                }
                            }
                            else{
                                if (( v == 5 && (!gamePage.workshop.get("turnSmoothly").researched && gamePage.timeTab.vsPanel.children[0].children[5].model.metadata.val > 0 && gamePage.resPool.get("temporalFlux").value - VoidBuild[5].model.prices.filter(res => res.name == "temporalFlux")[0].val < gamePage.workshop.get("turnSmoothly").prices.filter(res => res.name == "temporalFlux")[0].val)) || (v == 6 && gamePage.time.meta[0].meta[6].val < 3)){
                                  {}
                                }
                                else if ((v != 3 && v != 5 ) && ((VoidBuild[3].model.metadata.unlocked && VoidBuild[v].model.prices.filter(res => res.name == 'void')[0].val > voidcf * 0.1) || (VoidBuild[5].model.metadata.unlocked  && VoidBuild[v].model.prices.filter(res => res.name == 'void')[0].val > voidcf * 0.1 ))){
                                  {}
                                }
                                else if (gamePage.ironWill){
                                    if(!VoidBuild[v].model.metadata.effects.maxKittens ){
                                        var result = VoidBuild[v].controller.buyItem(VoidBuild[v].model, {});
                                        if (result && result.itemBought) {
                                            VoidBuild[v].update();
                                            gamePage.msg('Build in Time: ' + extractButtonNames(VoidBuild[v].model.name ));
                                        }
                                    }
                                }else{
                                    var result = VoidBuild[v].controller.buyItem(VoidBuild[v].model, {});
                                    if (result && result.itemBought) {
                                        VoidBuild[v].update();
                                        gamePage.msg('Build in Time: ' + extractButtonNames(VoidBuild[v].model.name ));
                                    }
                                }
                            }
						}

					}
				}
			} catch(err) {
			    console.log(err);
			}

	    }
        if (gamePage.workshop.get("chronoforge").researched){
            var chronoforge = gamePage.timeTab.cfPanel.children[0].children;
            var tc_val = gamePage.resPool.get("timeCrystal").value
            var factor = gamePage.challenges.getChallenge("1000Years").researched ? 5 : 10
            var fast_combust = (Math.max(tc_val, 600) < gamePage.resPool.get("void").value || (tc_val > 45 && gamePage.calendar.day < 10 && gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9)) && gamePage.time.meta[0].meta[6].val >= 1 && gamePage.religion.getTU("darkNova").on > 0
            var not_dark = gamePage.calendar.darkFutureYears(true) < 0

            if (gamePage.time.getCFU("blastFurnace").unlocked) {
                if (gamePage.calendar.cycle == 5 && gamePage.time.getCFU("blastFurnace").heat < 200  && gamePage.time.getCFU("blastFurnace").isAutomationEnabled) {
                    gamePage.time.getCFU("blastFurnace").isAutomationEnabled = false
                }
                else if (!gamePage.time.getCFU("blastFurnace").isAutomationEnabled && gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0 &&  gamePage.calendar.cycle != 5 ) {
                    gamePage.time.getCFU("blastFurnace").isAutomationEnabled = true
                }
            }

            if (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && gamePage.science.get("paradoxalKnowledge").researched){
                GlobalMsg['relicStation'] = gamePage.workshop.get("relicStation").label + ' ' + Math.round((gamePage.resPool.get("antimatter").value/gamePage.workshop.get("relicStation").prices.filter(res => res.name == 'antimatter')[0].val)*100) + '%';
            }


            if (!switches['CollectResBReset'] || gamePage.time.getCFU("ressourceRetrieval").val >= 1) {
                if (gamePage.time.getCFU("ressourceRetrieval").val > 0 && (!gamePage.challenges.isActive("1000Years") || gamePage.resPool.get("void").value > 800)){
                    if ( gamePage.resPool.get("unobtainium").value < gamePage.resPool.get("unobtainium").maxValue * 0.9 && (gamePage.resPool.energyProd - gamePage.resPool.energyCons >= 0 || gamePage.resPool.get("antimatter").value >= gamePage.resPool.get("antimatter").maxValue) && gamePage.calendar.day > 0 && (  (gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || (gamePage.time.meta[0].meta[6].val >= (gamePage.religion.getTU("darkNova").on > 0 ? 1 : 4)  )) && (((gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || ( (gamePage.time.meta[0].meta[6].val >= 3 || gamePage.time.heat < 50)  && (gamePage.workshop.get("relicStation").unlocked && !gamePage.workshop.get("relicStation").researched && gamePage.science.get("paradoxalKnowledge").researched)  && (tc_val > (fast_combust ? 5 : 45) && gamePage.bld.getBuildingExt('chronosphere').meta.val >= 10) && gamePage.space.getBuilding('sunlifter').val > 0 ))  || ( gamePage.time.meta[0].meta[6].val >= (gamePage.religion.getTU("darkNova").on > 0 ? 1 : 4) && ((gamePage.time.heat == 0 && ((gamePage.calendar.cycle != 5 && gamePage.prestige.getPerk("numerology").researched) || (gamePage.calendar.season > 0 && gamePage.time.meta[0].meta[6].val >= 3) ))  || ( (fast_combust ? true : gamePage.time.heat + 50 * factor < gamePage.getEffect("heatMax"))  && gamePage.calendar.cycle == 5 &&  (gamePage.calendar.season > 0 || (fast_combust ? true : gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9 && gamePage.calendar.day < 10))))))) {
                        if (gamePage.time.heat > gamePage.getEffect("heatMax") * 0.9 && factor *  chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal <= gamePage.getEffect("heatMax")  &&  [4, 5].indexOf(gamePage.calendar.cycle) == -1 && gamePage.time.meta[0].meta[6].val >= 1 && tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 5).timeCrystal ) {
                            if (gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal * factor){
                                chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle)
                                chronoforge[0].update();
                            }
                        }
                        else if (factor * chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 45).timeCrystal <= gamePage.getEffect("heatMax")  && (gamePage.calendar.cycle != 4 || gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9) && gamePage.time.meta[0].meta[6].val >= 3 && tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 45).timeCrystal) {
                            if ( gamePage.getEffect("heatMax")  - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 45).timeCrystal * factor &&  (gamePage.time.meta[0].meta[5].val >= 3 || (!gamePage.ironWill && gamePage.time.meta[0].meta[6].val >= 1))) {
                                chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle * (gamePage.calendar.cyclesPerEra - 1))
                                chronoforge[0].update();
                            }
                        }
                        else if (factor * chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal <= gamePage.getEffect("heatMax")  && (gamePage.calendar.cycle != 4 || gamePage.time.heat < gamePage.getEffect("heatMax") * 0.9) && gamePage.time.meta[0].meta[6].val >= 1 &&  tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 5).timeCrystal) {
                            if (gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 5).timeCrystal * factor){
                                chronoforge[0].controller.doShatterAmt(chronoforge[0].model, gamePage.calendar.yearsPerCycle)
                                chronoforge[0].update();
                            }
                        }
                        else if (tc_val >= gamePage.timeTab.cfPanel.children[0].children[0].controller.getPricesMultiple(gamePage.timeTab.cfPanel.children[0].children[0].model, 1).timeCrystal && gamePage.getEffect("heatMax") - gamePage.time.heat > chronoforge[0].controller.getPricesMultiple(chronoforge[0].model, 1).timeCrystal * factor) {
                                try {
                                    var result = chronoforge[0].controller.buyItem(chronoforge[0].model, {});
                                    if (result && result.itemBought) {
                                        chronoforge[0].update();
                                    }
                                } catch(err) {
                                    console.log(err);
                                }
                        }
                    }
                }
                else if (gamePage.calendar.cycle != 5 && gamePage.time.getCFU("ressourceRetrieval").val == 0 && tc_val >= 1 && gamePage.time.heat < gamePage.getEffect("heatMax") / 2){
                    chronoforge[0].controller.doShatterAmt(chronoforge[0].model, 1);
                    chronoforge[0].update();
                }
            }
            if ( gamePage.time.getCFU("ressourceRetrieval").unlocked || (gamePage.time.getCFU("blastFurnace").unlocked && gamePage.time.getCFU("blastFurnace").val < 2)) {
                try {
                    for (var t = 2 ;t < chronoforge.length; t++) {
                        if (!switches['CollectResBReset'] ) {
                            if (chronoforge[t].model.metadata.name != "ressourceRetrieval" && gamePage.time.getCFU("ressourceRetrieval").unlocked && (gamePage.time.getCFU("ressourceRetrieval").val > 2 ? Math.min(chronoforge[t].model.prices.filter(res => res.name == "timeCrystal")[0].val, gamePage.resPool.get("timeCrystal").value) : gamePage.resPool.get("timeCrystal").value)  > gamePage.timeTab.cfPanel.children[0].children[8].model.prices.filter(res => res.name == "timeCrystal")[0].val * (gamePage.time.getCFU("ressourceRetrieval").val > 3 ? 0.9 : 0.05)  && (gamePage.time.getCFU("ressourceRetrieval").val <= 3 || gamePage.religion.getZU("marker").val > 1) )
                            {}
                            else if ( (t != 3 && t != 8) && ((( gamePage.calendar.year < 40000  && gamePage.resPool.get("timeCrystal").value < 20000) || chronoforge[t].model.prices.filter(res => res.name == 'timeCrystal')[0].val > chronoforge[7].model.prices.filter(res => res.name == 'timeCrystal')[0].val * (gamePage.resPool.get("timeCrystal").value > (gamePage.resPool.get("unobtainium").maxValue * 0.01) ? 0.1 : 0.01)) || gamePage.time.getCFU("ressourceRetrieval").val <= 3) )
                            {}
                            else if (chronoforge[t].model.metadata.unlocked && chronoforge[t].model.enabled) {
                                var result = chronoforge[t].controller.buyItem(chronoforge[t].model, {});
                                    if (result && result.itemBought) {
                                        chronoforge[t].update();
                                        gamePage.msg('Build in Time: ' + extractButtonNames(chronoforge[t].model.name ));
                                    }
                            }
                        }
                    }

                } catch(err) {
                    console.log(err);
                }
            }
        }


        if (gamePage.workshop.get("turnSmoothly").researched) {
            if ( !gamePage.time.isAccelerated && gamePage.resPool.get("temporalFlux").value >= gamePage.resPool.get("temporalFlux").maxValue) {
                gamePage.time.isAccelerated = true
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
        autoSwitch('Iron Will',  'IronWill')
    }
}


function SellSpaceAndReset(){
     if (!gamePage.challenges.anyChallengeActive()) {
        msg = "Sell all space and Reset?";
        gamePage.ui.confirm($I("reset.confirmation.title"), msg, function() {
            let optsell = gamePage.opts.hideSell
            gamePage.opts.hideSell = false
            //sell all space
            if (gamePage.tabs[6].planetPanels.length > 3){
                gamePage.tabs[6].planetPanels[4].children[1].model.metadata.on = gamePage.tabs[6].planetPanels[4].children[1].model.metadata.val
            }
            for (var z = 0; z < gamePage.tabs[6].planetPanels.length; z++) {
                    var spBuild = gamePage.tabs[6].planetPanels[z].children;
                    try {
                        for (var s = 0 ;s < spBuild.length; s++) {
                            if (spBuild[s].model.metadata.unlocked && spBuild[s].model.metadata.val > 1 && spBuild[s].model.metadata.name != "containmentChamber") {
                                    spBuild[s].controller.sellInternal(spBuild[s].model,1);
                                }
                        }

                    } catch(err) {
                    console.log(err);
                    }
            }
            gamePage.opts.hideSell = optsell
            safeSetTimeout(function() { gamePage.resetAutomatic(); }, 10000);
            console.log("reset will be in 10 sec")
            $("#PriorityLabel")[0].innerText = "reset will be in 10 sec"
            clearInterval(runAllAutomation);
        });
     }
     else {
         gamePage.msg('You are in challenge now, please reset manually.');
     }
}

function LabelMsg(){
    GlobalMsg['chronosphere'] = ''
    if (gamePage.bld.getBuildingExt('chronosphere').meta.val < 10 && gamePage.bld.getBuildingExt('chronosphere').meta.unlocked && gamePage.resPool.get("unobtainium").value > 0  && gamePage.resPool.get("timeCrystal").value > 0){
        GlobalMsg['chronosphere'] = gamePage.bld.getBuildingExt('chronosphere').meta.label + '(1-10) ' +  Math.min(Math.round((gamePage.resPool.get("timeCrystal").value/Chronosphere10SummPrices()["timeCrystal"])*100),Math.round((gamePage.resPool.get("unobtainium").value/Chronosphere10SummPrices()["unobtainium"])*100)) + '%';
    }


   let gmsgarr = []
   for (let key of Object.keys(GlobalMsg)) {
     if (GlobalMsg[key]) {
        gmsgarr[gmsgarr.length] = GlobalMsg[key]
     }
   }
   $("#PriorityLabel")[0].innerText =  gmsgarr.join(' / ')
}

function Chronosphere10SummPrices() {
	 	var bldPrices = gamePage.bld.getBuildingExt('chronosphere').get('prices');
		var ratio = gamePage.bld.getPriceRatioWithAccessor(gamePage.bld.getBuildingExt('chronosphere'));

		var prices = {};
        var sumVal = 0;

		for (var cr = 0; cr< bldPrices.length; cr++){
		    sumVal = 0;
		    for (var g = gamePage.bld.getBuildingExt('chronosphere').meta.val; g <= Math.max(gamePage.bld.getBuildingExt('chronosphere').meta.val,9); g++){
		        sumVal+= bldPrices[cr].val * Math.pow(ratio, g)
		    }

            prices[bldPrices[cr].name] = sumVal
		}
	    return prices;
}




gamePage.tabs.filter(tab => tab.tabId != "Stats" ).forEach(tab => tab.render());

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
gamePage.ui.render();

var runAllAutomation = setInterval(function() {
    if (tick != gamePage.timer.ticksTotal) {
        tick = gamePage.timer.ticksTotal;
        safeSetTimeout(autoBuild, 2);
        safeSetTimeout(autoNip, 0);
        safeSetTimeout(autoRefine, 1);
        safeSetTimeout(LabelMsg, 0);

        if (gamePage.timer.ticksTotal % 3 === 0) {
            safeSetTimeout(autoObserve, 0);
            safeSetTimeout(autoCraft2, 1);
            safeSetTimeout(autoAssign, 0);
            gamePage.villageTab.updateTab();
        }

        if (gamePage.timer.ticksTotal % 10 === 0) {
            safeSetTimeout(autoSpace, 1);
        }

        if (gamePage.timer.ticksTotal % 25 === 0) {
             safeSetTimeout(energyControl, 0);
             safeSetTimeout(autoParty, 0);
             safeSetTimeout(autoTrade, 1);
             safeSetTimeout(autoResearch, 2);
             safeSetTimeout(autoWorkshop, 2);
             safeSetTimeout(autoPraise, 2);
             safeSetTimeout(autoHunt, 3);

        }

        if (gamePage.timer.ticksTotal % 30 === 0) {
             safeSetTimeout(Timepage, 0);
        }

         if (gamePage.timer.ticksTotal % 50 === 0) {
             safeSetTimeout(ResearchSolarRevolution, 0);
             safeSetTimeout(UpgradeBuildings, 1);

        }

        if (gamePage.timer.ticksTotal % 151 === 0) {
            safeSetTimeout(RenderNewTabs, 1);
        }
        if (gamePage.timer.ticksTotal % 11 === 0) {
            safeSetTimeout(autozig, 0);
        }
        if (gamePage.timer.ticksTotal % 755 === 0) {
            safeSetTimeout(Service, 2);
        }
    }

}, 50);

function safeSetTimeout(fn, delay) {
    var id = setTimeout(fn, delay);
    activeTimeouts.push(id);
    return id;
}

