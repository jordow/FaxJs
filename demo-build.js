if (!Function.prototype.bind) { Function.prototype.bind = function (oThis) { if (typeof this !== 'function') throw new TypeError('Function.prototype.bind - what is trying to be fBound is not callable'); var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {}, fBound = function () { return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    }; fNOP.prototype = this.prototype; fBound.prototype = new fNOP(); return fBound; }; }
if (!Array.prototype.filter) { Array.prototype.filter = function(fun /*, thisp*/) { var len = this.length >>> 0; if (typeof fun != 'function') { throw new TypeError(); } var res = []; var thisp = arguments[1]; for (var i = 0; i < len; i++) { if (i in this) { var val = this[i]; if (fun.call(thisp, val, i, this)) { res.push(val); } } } return res; }; }
var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}
var __require = require;

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require.resolve = (function () {
    var core = {
        'assert': true,
        'events': true,
        'fs': true,
        'path': true,
        'vm': true
    };
    
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.modules["path"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "path";
    
    var require = function (file) {
        return __require(file, ".");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, ".");
    };
    
    require.modules = __require.modules;
    __require.modules["path"]._cached = module.exports;
    
    (function () {
        function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
;
    }).call(module.exports);
    
    __require.modules["path"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/Fax/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/Fax";
    var __filename = "/node_modules/Fax/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/Fax");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/Fax");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/Fax/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"Fax","description":"Declarative Components","url":"http://none.org","keywords":["fax","Fax","FaxUi","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./Fax","engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/Fax/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/Fax/Fax.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/Fax";
    var __filename = "/node_modules/Fax/Fax.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/Fax");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/Fax");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/Fax/Fax.js"]._cached = module.exports;
    
    (function () {
        var FaxUtils=require("./FaxUtils"),FaxEvent=require("./FaxEvent");var _Fax={beforeRendering:[]};_Fax.Fatal=function(str){if(console&&console.log){console.log("[FATAL] :"+str)}throw str};_Fax.Error=function(str){if(console&&console.log){console.log("[ERROR] :"+str)}};_Fax.Info=function(str){if(console&&console.log){console.log("[INFO] :"+str)}};function _clone(o){return JSON.parse(JSON.stringify(o))}function _ser(o){return JSON.stringify(o)}if(typeof Fax==="object"){if(Fax.keys(Fax._eventsById).length){_Fax.Error("Unexpected pre-initialization")}}_Fax.TextNode=function(str){return{__textNode:true,text:str}};_Fax.controlDirectlyDomAttrsMap={innerHtml:"innerHTML",value:"value",scrollTop:"scrollTop",scrollLeft:"scrollLeft"};var _controlUsingSetAttrDomAttrsMap={margin:"margin",marginRight:"margin-right",marginLeft:"margin-left",marginTop:"margin-top",marginBottom:"margin-bottom",padding:"padding",paddingRight:"padding-right",paddingLeft:"padding-left",paddingTop:"padding-top",paddingBottom:"padding-bottom",width:"width",height:"height",clss:"class",href:"href",src:"src"};_Fax.cannotEverControl={type:"type"};_Fax.markupDomTagAttrsMap={margin:"margin",marginRight:"margin-right",marginLeft:"margin-left",marginTop:"margin-top",marginBottom:"margin-bottom",padding:"padding",paddingRight:"padding-right",paddingLeft:"padding-left",paddingTop:"padding-top",paddingBottom:"padding-bottom",value:"value",width:"width",height:"height",clss:"class",type:"type",href:"href",src:"src"};var _styleAttrNameForLogicalName=function(attr){return{boxSizing:"box-sizing",boxShadow:"box-shadow",paddingRight:"padding-right",paddingLeft:"padding-left",paddingTop:"padding-top",paddingBottom:"padding-bottom",marginRight:"margin-right",marginLeft:"margin-left",marginTop:"margin-top",marginBottom:"margin-bottom",zIndex:"z-index",backgroundImage:"background-image",border:"border",borderTop:"border-top",fontSize:"font-size",fontWeight:"font-weight",fontColor:"font-color",textTransform:"text-transform",textDecoration:"text-decoration",textAlign:"text-align",borderLeft:"border-left",borderRight:"border-right",borderBottom:"border-bottom",borderColor:"border-color",position:"position",backgroundColor:"background-color"}[attr]||attr};var _cssNumber={textDecoration:true,zoom:true,fillOpacity:true,fontWeight:true,lineHeight:true,opacity:true,orphans:true,widows:true,zIndex:true,outline:true};var _styleValue=function(logicalStyleAttrName,attrVal){if(typeof attrVal==="number"){return _cssNumber[logicalStyleAttrName]?attrVal:attrVal+"px"}return attrVal};function _tagDomAttrMarkupFragment(tagAttrName,tagAttrVal){if(tagAttrVal&&tagAttrVal.__textNode){return _Fax.markupDomTagAttrsMap[tagAttrName]+"='"+FaxUtils.escapeTextNodeForBrowser(tagAttrVal)+"'"}else if(tagAttrVal){_Fax.Fatal("Saw dom attr fragment value for key "+tagAttrName+" but does not appear to expect escaping")}return""}function _innerHtmlMarkupFragment(innerHtmlAttrVal){if(innerHtmlAttrVal&&innerHtmlAttrVal.__textNode){return FaxUtils.escapeTextNodeForBrowser(innerHtmlAttrVal)}else if(innerHtmlAttrVal){_Fax.Fatal("Saw innerHtml fragment but does not appear to expect escaping")}return""}function _tagStyleAttrFragment(styleObj){var styleAccum=' style="',logStyleAttrName,styleAttrVal;for(logStyleAttrName in styleObj){if(!styleObj.hasOwnProperty(logStyleAttrName)){continue}styleAttrVal=styleObj[logStyleAttrName];if(styleAttrVal!==undefined&&styleAttrVal!==null){styleAccum+=_styleAttrNameForLogicalName(logStyleAttrName)+":"+_styleValue(logStyleAttrName,styleObj[logStyleAttrName])+";"}}return styleAccum+'"'}var _serializeInlineStyle=function(styleObj){var accum="",logStyleAttrName;for(var logStyleAttrName in styleObj){if(!styleObj.hasOwnProperty(logStyleAttrName)){continue}styleAttrVal=styleObj[logStyleAttrName];if(styleAttrVal!==undefined&&styleAttrVal!==null){accum+=_styleAttrNameForLogicalName(logStyleAttrName)+":"+_styleValue(logStyleAttrName,styleAttrVal)+";"}}return accum};_Fax.renderAt=function(projection,id){FaxEvent.ensureListening();if(_Fax.beforeRendering.length){for(var i=_Fax.beforeRendering.length-1;i>=0;i--){_Fax.beforeRendering[i]()}}var componentInstance=new projection.maker(projection.props);var markup=componentInstance.genMarkup(".top",true,true);var mountAt=document.getElementById(id);var nextSibling=mountAt.nextSibling;var parent=mountAt.parentNode;parent.removeChild(mountAt);mountAt.innerHTML=markup;if(nextSibling){parent.insertBefore(mountAt,nextSibling)}else{parent.appendChild(mountAt)}_executeDomReadyQueue();var renderedComponentInstance=componentInstance;return renderedComponentInstance};_Fax.renderTopLevelComponentAt=function(TopLevelProjectingConstructor,id,options){var dims=FaxUtils.getViewportDims();var cookies=FaxUtils.readCookie()||{};var topLevelCreateData={chromeWidth:dims.chromeWidth,chromeHeight:dims.chromeHeight,cookies:cookies};var topLevelProjection=TopLevelProjectingConstructor(topLevelCreateData);if(options&&options.appStyle){document.body.className+=" nover"}var renderedComponentInstance=_Fax.renderAt(topLevelProjection,id);window.onresize=function(){dims=FaxUtils.getViewportDims();var updateProps={chromeHeight:dims.height,chromeWidth:dims.width,cookies:cookies}};FaxUtils._onCookieChange=function(){cookies=FaxUtils.readCookie()||{};var updateProps={chromeHeight:dims.height,chromeWidth:dims.width,cookies:cookies};renderedComponentInstance.doControl(updateProps)};return renderedComponentInstance};_Fax.mergeStuff=function(ths,merge){for(var aKey in merge){if(!merge.hasOwnProperty(aKey)){continue}ths[aKey]=merge[aKey]}return ths};_Fax.merge=function(one,two){var ret={},aKey,one=one||{},two=two||{};for(aKey in one){if(one.hasOwnProperty(aKey)){ret[aKey]=one[aKey]}}for(aKey in two){if(two.hasOwnProperty(aKey)){ret[aKey]=two[aKey]}}return ret};_Fax.mergeThree=function(one,two,three){var ret={},aKey,one=one||{},two=two||{},three=three||{};for(aKey in one){if(one.hasOwnProperty(aKey)){ret[aKey]=one[aKey]}}for(aKey in two){if(two.hasOwnProperty(aKey)){ret[aKey]=two[aKey]}}for(aKey in three){if(three.hasOwnProperty(aKey)){ret[aKey]=three[aKey]}}return ret};_Fax.mergeDeep=function(obj1,obj2){if(obj1 instanceof Array||obj2 instanceof Array){throw"mergeDeep not intended for merging arrays"}var obj2Terminal=obj2===undefined||obj2===null||typeof obj2==="string"||typeof obj2==="number"||typeof obj2==="function";if(obj2Terminal){return obj2}var obj1Terminal=obj1===undefined||obj1===null||typeof obj1==="string"||typeof obj1==="number"||typeof obj1==="function";if(obj1Terminal){obj1=obj1||{}}for(var obj2Key in obj2){if(!obj2.hasOwnProperty(obj2Key)){continue}obj1[obj2Key]=_Fax.mergeDeep(obj1[obj2Key],obj2[obj2Key])}return obj1};var Mixin=function(constructor,methodBag){MixinExcluded(constructor,methodBag,{})};var MixinExcluded=function(constructor,methodBag,blackList){for(var methodName in methodBag){if(!methodBag.hasOwnProperty(methodName)){continue}if(blackList[methodName]){continue}constructor.prototype[methodName]=methodBag[methodName]}};_Fax.MakeComponentClass=function(spec,addtlMixins){var specKey=null,mixinKey=null;var prototypeBlackList={initModel:true};var ComponentClass=function(initProps){this.props=initProps||{};this._strigifiedProps=null;this.model={};this.lock=false;if(spec.initModel){if(typeof spec.initModel==="function"){this.model=spec.initModel.call(this,initProps)}else{this.model=_clone(spec.initModel)}}};MixinExcluded(ComponentClass,spec,prototypeBlackList);Mixin(ComponentClass,_Fax.universalPublicMixins);Mixin(ComponentClass,_Fax.universalPrivateMixins);for(var j=0;j<addtlMixins.length;j++){Mixin(ComponentClass,addtlMixins[j])}if(!ComponentClass.prototype._allocateChildrenGenMarkup||!ComponentClass.prototype.project){_Fax.Error("Class does not implement required functions!")}return ComponentClass};_Fax.universalPublicMixins={doControl:function(props){if(this._propertyTrigger){var nextModelFragment=this._propertyTrigger(props);if(nextModelFragment){this.justUpdateModel(nextModelFragment)}}this.props=props;this._recomputeProjectionAndPropagate()},genMarkup:function(idTreeSoFar,gen,events){this._rootDomId=idTreeSoFar;return this._allocateChildrenGenMarkup(idTreeSoFar,gen,events)}};_Fax.universalPrivateMixins={justUpdateModel:function(nextModelFragment){_Fax.mergeStuff(this.model,nextModelFragment)},justUpdateModelDeep:function(nextModelFragment){this.model=_Fax.mergeDeep(this.model,nextModelFragment)},updater:function(fragLiteral){var that=this;return function(){that.updateModel(fragLiteral)}},updateModel:function(nextModelFragment){if(this.lock){throw"Cannot props state before your done projecting!!"}this.justUpdateModel(nextModelFragment);this._recomputeProjectionAndPropagate();Fax.executePostProjectionQueue();return true},updateModelDeep:function(nextModelFragment){if(this.lock){throw"Cannot props state before your done projecting!!"}this.justUpdateModelDeep(nextModelFragment);this._recomputeProjectionAndPropagate();Fax.executePostProjectionQueue();return true},_reproject:function(){this._recomputeProjectionAndPropagate()},_childAt:function(s){}};_Fax.maybeInvoke=function(f){if(f){f()}};_Fax.crossProduct=function(arr1,arr2,handler){for(var i=0;i<arr1.length;i++){for(var j=0;j<arr2.length;j++){handler(arr1[i],arr2[j])}}};_Fax.objMapToArray=function(obj,mapper){var ret=[],aKey;for(aKey in obj){if(obj.hasOwnProperty(aKey)){ret.push(mapper(obj[aKey],aKey))}}return ret};_Fax.arrayMapToObj=function(arr,mapper){var ret={},res;for(var i=arr.length-1;i>=0;i--){res=mapper(arr[i],i);ret[res.key]=res.value}return ret};_Fax.keys=function(obj){var ret=[],aKey;for(aKey in obj){if(obj.hasOwnProperty(aKey)){ret.push(aKey)}}return ret};_Fax.keyCount=function(obj){return _Fax.keys(obj).length};_Fax.objSubset=function(obj,selectMap){var ret={},aKey;for(aKey in obj){if(obj.hasOwnProperty(aKey)&&selectMap[aKey]){ret[aKey]=obj[aKey]}}return ret};_Fax.objExclusion=function(obj,filterOutMap){var ret={},filterOutMap=filterOutMap||{},aKey;for(aKey in obj){if(obj.hasOwnProperty(aKey)&&!filterOutMap[aKey]){ret[aKey]=obj[aKey]}}return ret};_Fax.copyProps=function(obj,obj2){for(var key in obj2){if(!obj2.hasOwnProperty(key)){continue}obj[key]=obj2[key]}return obj};_Fax.shallowClone=function(obj){return Fax.copyProps({},obj)};_Fax.multiComponentMixins={_recomputeProjectionAndPropagate:function(){var childKey,child,projection;projection=this.props;for(childKey in this.children){if(!this.children.hasOwnProperty(childKey)){continue}child=this.children[childKey];child.doControl(projection[childKey].props)}},_allocateChildrenGenMarkup:function(idSpaceSoFar,gen,events){var projection,childKey,child,markupAccum,newChild;markupAccum="";this.children={};projection=this.props;for(childKey in projection){if(!this.props.hasOwnProperty(childKey)){continue}newChild=new projection[childKey].maker(projection[childKey].props);markupAccum+=newChild.genMarkup(idSpaceSoFar+("."+childKey),gen,events);this.children[childKey]=newChild}return markupAccum},project:function(){return this.props}};_Fax.standardComponentMixins={_recomputeProjectionAndPropagate:function(){this.child.doControl(this._getProjection().props);if(this.postProjection){Fax.postProjectionDelegateQueue.push(this)}},_allocateChildrenGenMarkup:function(idSpaceSoFar,gen,events){if(this.onDomReady){Fax.onDomReadyDelegateQueue.push(this)}if(this.postProjection){Fax.postProjectionDelegateQueue.push(this)}var projection=this._getProjection();this.child=new projection.maker(projection.props);return this.child.genMarkup(idSpaceSoFar,gen,events)},_getProjection:function(){this.lock=true;var projection=this.project();this.lock=false;return projection},_controlDomNode:function(path,domAttrs){var normalized=path.replace("projection","");var elem=document.getElementById(this._rootDomId+normalized);_Fax.controlPhysicalDomNode(elem,domAttrs)},_childDom:function(path){var normalized=path.replace("projection","");return document.getElementById(this._rootDomId+normalized)}};_Fax.orderedComponentMixins={_recomputeProjectionAndPropagate:function(){var child,projection,newMarkup;projectionToReconcile=this.props;var numAlreadyExistingThatShouldRemain=Math.min(this.children.length,projectionToReconcile.length);for(var jj=0;jj<numAlreadyExistingThatShouldRemain;jj++){child=this.children[jj];child.doControl(projectionToReconcile[jj].props)}for(var ii=projectionToReconcile.length;ii<this.children.length;ii++){var domNodeToRemove=document.getElementById(this._rootDomId+"."+ii);if(!domNodeToRemove){_Fax.Error("No DOM node to hide!")}domNodeToRemove.parentNode.removeChild(domNodeToRemove)}for(var kk=numAlreadyExistingThatShouldRemain;kk<projectionToReconcile.length;kk++){newChild=new projectionToReconcile[kk].maker(projectionToReconcile[kk].props);newMarkup=newChild.genMarkup(this._rootDomId+("."+kk),true,true);this.children[kk]=newChild;Fax.appendMarkup(document.getElementById(this._rootDomId),newMarkup)}Fax.executeDomReadyQueue();Fax.executePostProjectionQueue();this.children.length=projectionToReconcile.length},_allocateChildrenGenMarkup:function(idSpaceSoFar,gen,events){var jj,projection,childKey,child,markupAccum,newChild;markupAccum='<div id="'+idSpaceSoFar+'" style="display:inherit">';projection=this.props;this.children=[];for(jj=0;jj<projection.length;jj++){newChild=new projection[jj].maker(projection[jj].props);markupAccum+=newChild.genMarkup(idSpaceSoFar+("."+jj),gen,events);this.children[jj]=newChild}markupAccum+="</div>";return markupAccum},project:function(){return this.props}};_Fax.multiChildMixins={_allocateChildrenGenChildMarkup:function(idSpaceSoFar,gen,events){var projection,childKey,markupAccum="",newChild;projection=this.props;this.children={};var childComponents=this.children;for(childKey in projection){if(!projection.hasOwnProperty(childKey)){continue}var childProjection=projection[childKey];newChild=new childProjection.maker(childProjection.props);markupAccum+=newChild.genMarkup(idSpaceSoFar+("."+childKey),gen,events);childComponents[childKey]=newChild}return markupAccum},_recomputeProjectionAndPropagate:function(){var deallocateChildren={};var keepChildrenInstances={};var projectionToReconcile=this.props;var newMarkup,childComponents=this.children;var parentDomNode=document.getElementById(this._rootDomId);for(var currentChildKey in childComponents){if(!childComponents.hasOwnProperty(currentChildKey)){continue}var currentChildComponent=childComponents[currentChildKey];var newProjection=projectionToReconcile[currentChildKey];if(currentChildComponent&&newProjection&&newProjection.maker&&newProjection.maker===currentChildComponent.constructor){keepChildrenInstances[currentChildKey]=currentChildComponent;currentChildComponent.doControl(newProjection.props)}else{deallocateChildren[currentChildKey]=currentChildComponent}}for(var deallocateChildKey in deallocateChildren){if(!deallocateChildren.hasOwnProperty(deallocateChildKey)){continue}var deallocateChild=childComponents[deallocateChildKey];if(deallocateChild&&deallocateChild.doControl){var domNodeToRemove=document.getElementById(this._rootDomId+"."+deallocateChildKey);domNodeToRemove.parentNode.removeChild(domNodeToRemove);delete childComponents[deallocateChildKey]}}var newChildren=keepChildrenInstances;var lastIteratedDomNode=null;for(var projectionKey in projectionToReconcile){if(!projectionToReconcile.hasOwnProperty(projectionKey)){continue}var projectionForKey=projectionToReconcile[projectionKey];if(!childComponents[projectionKey]){if(projectionForKey&&projectionForKey.maker){newChild=new projectionForKey.maker(projectionForKey.props);newMarkup=newChild.genMarkup(this._rootDomId+("."+projectionKey),true,true);childComponents[projectionKey]=newChild;var newDomNode=Fax.singleDomNodeFromMarkup(newMarkup);lastIteratedDomNode=Fax.insertNodeAfterNode(parentDomNode,newDomNode,lastIteratedDomNode)}else{childComponents[projectionKey]=projectionForKey}}else{lastIteratedDomNode=document.getElementById(this._rootDomId+"."+projectionKey)||lastIteratedDomNode}}Fax.executeDomReadyQueue();Fax.executePostProjectionQueue()},project:function(){return this.props}};_Fax.multiDynamicComponentMixins={_recomputeProjectionAndPropagate:_Fax.multiChildMixins._recomputeProjectionAndPropagate,_allocateChildrenGenMarkup:function(idSpaceSoFar,gen,events){return'<div id="'+idSpaceSoFar+'" style="display:inherit">'+_Fax.multiChildMixins._allocateChildrenGenChildMarkup.call(this,idSpaceSoFar,gen,events)+"</div>"},project:function(){return this.props}};_Fax.Componentize=function(spec){var Constructor=Fax.MakeComponentClass(spec,[_Fax.standardComponentMixins]);var ProjectingConstructor=function(propsArgs){var props=propsArgs||this;return{props:props,maker:Constructor}};ProjectingConstructor.originalSpec=spec;return ProjectingConstructor};_Fax.ComponentizeAll=function(obj){var ret={};for(var memberName in obj){if(!obj.hasOwnProperty(memberName)){continue}var potentialComponent=obj[memberName];if(potentialComponent&&typeof potentialComponent!="function"&&potentialComponent.project){ret[memberName]=_Fax.Componentize(potentialComponent)}else{ret[memberName]=potentialComponent}}return ret};_Fax.controlPhysicalDomNode=function(elem,nextProps){var styleAttr,styleAttrVal,nextPropsStyleAttrVal,logStyleAttrName,style=nextProps.style;for(var propKey in nextProps){if(!nextProps.hasOwnProperty(propKey)){continue}var prop=nextProps[propKey];if(propKey==="style"){for(var logStyleAttrName in style){if(!style.hasOwnProperty(logStyleAttrName)){continue}var styleAttrVal=style[logStyleAttrName];if(styleAttrVal!==undefined&&styleAttrVal!==null){elem.style[_styleAttrNameForLogicalName(logStyleAttrName)]=_styleValue(logStyleAttrName,styleAttrVal)}}}else if(_controlUsingSetAttrDomAttrsMap[propKey]){if(prop.__textNode){elem.setAttribute(_controlUsingSetAttrDomAttrsMap[propKey],FaxUtils.escapeTextNodeForBrowser(prop))}else{_Fax.Fatal("Property: "+propKey+" should be but did not expect to"+" be escaped when controlling dom node - wrap in TextNode:"+elem.id)}}else if(_Fax.controlDirectlyDomAttrsMap[propKey]){if(prop.__textNode){elem[_Fax.controlDirectlyDomAttrsMap[propKey]]=FaxUtils.escapeTextNodeForBrowser(prop)}else{_Fax.Fatal("Property: "+propKey+" should be but did not expect to"+" be escaped when controlling dom node - wrap in TextNode:"+elem.id)}}}};function _makeDomContainerComponent(tag,optionalTagTextPar,pre,post,headText,footText){var optionalTagText=optionalTagTextPar?" "+optionalTagText:"";var tagOpen=(pre||"")+"<"+tag+optionalTagText+" id='";var tagClose=(footText||"")+"</"+tag+">"+(post||"");var headTextTagClose=">"+(headText||"");var ProjectingConstructor=function(propsParam){var props=propsParam||this;return{props:props,maker:NativeComponentConstructor}};var NativeComponentConstructor=function(initProps){this._rootDomId=null;this._currentProps=initProps;this.children={}};NativeComponentConstructor.prototype.doControl=function(nextProps){if(!this._rootDomId){throw"Trying to control a native dom element without a backing id"}var deallocateChildren={};var keepChildrenInstances={};var projectionToReconcile=nextProps;var newMarkup,childComponents=this.children;var parentDomNode=document.getElementById(this._rootDomId);this.lastProps=nextProps;_Fax.controlPhysicalDomNode(parentDomNode,nextProps);this._currentProps=nextProps;FaxEvent.registerHandlers(this._rootDomId,nextProps);if(nextProps.handlers){FaxEvent.registerHandlers(this._rootDomId,nextProps.handlers)}for(var currentChildKey in childComponents){if(!childComponents.hasOwnProperty(currentChildKey)){continue}var currentChildComponent=childComponents[currentChildKey];var newProjection=projectionToReconcile[currentChildKey];if(currentChildComponent&&newProjection&&newProjection.maker&&newProjection.maker===currentChildComponent.constructor){keepChildrenInstances[currentChildKey]=currentChildComponent;currentChildComponent.doControl(newProjection.props)}else{deallocateChildren[currentChildKey]=currentChildComponent}}for(var deallocateChildKey in deallocateChildren){if(!deallocateChildren.hasOwnProperty(deallocateChildKey)){continue}var deallocateChild=childComponents[deallocateChildKey];if(deallocateChild&&deallocateChild.doControl){var domNodeToRemove=document.getElementById(this._rootDomId+"."+deallocateChildKey);domNodeToRemove.parentNode.removeChild(domNodeToRemove);delete childComponents[deallocateChildKey]}}var newChildren=keepChildrenInstances;var lastIteratedDomNode=null;for(var projectionKey in projectionToReconcile){if(!projectionToReconcile.hasOwnProperty(projectionKey)){continue}var projectionForKey=projectionToReconcile[projectionKey];var childControllableDomAttr=_controlUsingSetAttrDomAttrsMap[projectionKey];if(childControllableDomAttr){if(projectionForKey&&projectionForKey.__textNode){parentDomNode.setAttribute(childControllableDomAttr,FaxUtils.escapeTextNodeForBrowser(projectionForKey))}else{_Fax.Error("Encountered propertyDomAttr not intended to be escaped:"+projectionKey)}}else if(_Fax.controlDirectlyDomAttrsMap[projectionKey]){if(projectionForKey&&projectionForKey.__textNode){parentDomNode[_Fax.controlDirectlyDomAttrsMap[projectionKey]]=FaxUtils.escapeTextNodeForBrowser(projectionForKey)}else{_Fax.Error("Encountered propertyDomAttr not intended to be escaped:"+projectionKey)}}else if(projectionKey==="style"){for(var styleAttr in projectionForKey){if(!projectionForKey.hasOwnProperty(styleAttr)){continue}parentDomNode.style[styleAttr]=projectionForKey[styleAttr]}}else if(!childComponents[projectionKey]){if(projectionForKey&&projectionForKey.maker){newChild=new projectionForKey.maker(projectionForKey.props);newMarkup=newChild.genMarkup(this._rootDomId+("."+projectionKey),true,true);childComponents[projectionKey]=newChild;var newDomNode=Fax.singleDomNodeFromMarkup(newMarkup);lastIteratedDomNode=Fax.insertNodeAfterNode(parentDomNode,newDomNode,lastIteratedDomNode)}else{childComponents[projectionKey]=projectionForKey}}else{lastIteratedDomNode=document.getElementById(this._rootDomId+"."+projectionKey)||lastIteratedDomNode}}Fax.executeDomReadyQueue();Fax.executePostProjectionQueue()};NativeComponentConstructor.prototype.genMarkup=function(idTreeSoFar,shouldGenMarkup,shouldRegHandlers){var containedIdRoot,newComponent,propKey,prop,childrenAccum="",tagAttrAccum="",currentProps=this._currentProps,containedComponents=this.children;this._rootDomId=idTreeSoFar;var header=tagOpen+idTreeSoFar+"' ";for(propKey in currentProps){if(!currentProps.hasOwnProperty(propKey)){continue}prop=currentProps[propKey];if(shouldRegHandlers){if(typeof prop==="function"){FaxEvent.registerHandlerByName(idTreeSoFar,propKey,prop)}else if(propKey==="handlers"&&prop){FaxEvent.registerHandlers(idTreeSoFar,prop)}}if(shouldGenMarkup&&prop){if(propKey==="style"){tagAttrAccum+=_tagStyleAttrFragment(prop)}else if(_Fax.markupDomTagAttrsMap[propKey]){tagAttrAccum+=_tagDomAttrMarkupFragment(propKey,prop)}else if(prop.maker){containedIdRoot=idTreeSoFar+"."+propKey;newComponent=new prop.maker(prop.props);containedComponents[propKey]=newComponent;childrenAccum+=newComponent.genMarkup(containedIdRoot,shouldGenMarkup,shouldRegHandlers)}else if(prop===null){containedComponents[propKey]=null}else if(propKey==="innerHtml"){childrenAccum+=_innerHtmlMarkupFragment(prop)}else{}}else if(prop&&prop.maker){containedIdRoot=idTreeSoFar+"."+propKey;newComponent=new prop.maker(prop.props);containedComponents[propKey]=newComponent;newComponent.genMarkup(containedIdRoot,shouldGenMarkup,shouldRegHandlers);return null}}if(shouldGenMarkup){return header+tagAttrAccum+headTextTagClose+childrenAccum+tagClose}else{return null}};return ProjectingConstructor}var _usingInImpl=function(namespace,uiPackages){if(!namespace){_Fax.Error("Namespace is falsey wtf!")}var _appendAll=function(){for(var i=0;i<uiPackages.length;i++){var uiPackage=uiPackages[i];for(var uiComponent in uiPackages[i]){var packageVal=uiPackage[uiComponent];if(!uiPackage.hasOwnProperty(uiComponent)){continue}if(typeof packageVal==="function"){namespace[uiComponent]=packageVal}else if(packageVal&&packageVal.project!==undefined){namespace[uiComponent]=Fax.Componentize(packageVal)}}}};_appendAll();_Fax.beforeRendering.push(_appendAll)};var updater=function(queue,literal){return function(){queue.push(literal)}};_Fax.using=function(){var uiPackages=[];for(var i=0;i<arguments.length;i++){uiPackages.push(arguments[i])}var ns;if(Fax.populateNamespace){ns=Fax.populateNamespace}else{ns=Object.prototype}_usingInImpl(ns,uiPackages)};var _sure=function(obj,propsArr){var doesntHave=[];for(var jj=propsArr.length-1;jj>=0;jj--){if(!obj.hasOwnProperty([propsArr[jj]])){doesntHave.push(propsArr[jj])}}if(doesntHave.length!==0){throw"Properties not present:"+_ser(propsArr)}};var _curryOne=function(func,val){if(!func){return null}return function(){var newArgs=[val];for(var i=arguments.length-1;i>=0;i--){newArgs.push(arguments[i])}func.apply(null,newArgs)}};var _executeDomReadyQueue=function(){for(var ii=0;ii<Fax.onDomReadyDelegateQueue.length;ii++){Fax.onDomReadyDelegateQueue[ii].onDomReady()}Fax.onDomReadyDelegateQueue=[]};var _executePostProjectionQueue=function(){for(var ii=0;ii<Fax.postProjectionDelegateQueue.length;ii++){Fax.postProjectionDelegateQueue[ii].postProjection()}Fax.postProjectionDelegateQueue=[]};var _appendMarkup=function(elem,newMarkup){var div=document.createElement("div");div.innerHTML=newMarkup;var elements=div.childNodes;for(var elemIdx=elements.length-1;elemIdx>=0;elemIdx--){elem.appendChild(elements[elemIdx])}};var _singleDomNodeFromMarkup=function(newMarkup){var div=document.createElement("div");div.innerHTML=newMarkup;var elements=div.childNodes;for(var elemIdx=elements.length-1;elemIdx>=0;elemIdx--){return elements[elemIdx]}throw"Could not create single dom node"};var _appendNode=function(elem,node){elem.appendChild(node)};var _insertNodeBeforeNode=function(elem,insertNode,insertBeforeNode){return elem.insertBefore(insertNode,insertBeforeNode)};var _insertNodeAfterNode=function(elem,insertNode,insertAfterNode){if(insertAfterNode){if(insertAfterNode.nextSibling){return elem.insertBefore(insertNode,insertAfterNode.nextSibling)}else{return elem.appendChild(insertNode)}}else{return elem.insertBefore(insertNode,elem.firstChild)}};var _str=function(str){return str?str:""};var _clssMap=function(map){var accum="";for(var clssName in map){if(!map.hasOwnProperty(clssName)){continue}if(map[clssName]){accum+=clssName+" "}}return accum};_Fax.clssSet=function(namedSet){var accum="";for(var nameOfClass in namedSet){if(!namedSet.hasOwnProperty(nameOfClass)){continue}var val=namedSet[nameOfClass];if(val===true||val===1){accum+=nameOfClass+" "}else if(nameOfClass&&val){accum+=val}}return{__textNode:true,text:accum,escaped:true}};var _clssList=function(clssList){var accum="";for(jj=clssList.length-1;jj>=0;jj--){if(clssList[jj]!==undefined&&clssList[jj]!==null){accum+=clssList[jj]+" "}}return accum};var _fastClssMap=function(thing1,thing2){var map,clssList,jj,accum="";if(thing1&&!thing2){map=thing1;clssList=null}else{map=thing2;clssList=thing1}if(!clssList){return _clssMap(map)}else{for(jj=clssList.length-1;jj>=0;jj--){if(map[clssList[jj]]){accum+=clssList[jj]+" "}}return accum.substr(0,accum.length-1)}};_Fax.extractCssPosInfo=function(obj){return obj.posInfo||Fax.objSubset(obj,{width:true,height:true,left:true,top:true,bottom:true,right:true,zIndex:true,position:true})};_Fax.extractPosInfo=function(obj){return obj.posInfo||Fax.objSubset(obj,{w:true,h:true,l:true,t:true,b:true,r:true,z:true})};_Fax.sealPosInfo=function(posInfo){var ret={};if(posInfo.w){ret.width=posInfo.w.charAt?posInfo.w:posInfo.w+"px"}if(posInfo.h){ret.height=posInfo.h.charAt?posInfo.h:posInfo.h+"px"}if(posInfo.l){ret.left=posInfo.l.charAt?posInfo.l:posInfo.l+"px"}if(posInfo.t){ret.top=posInfo.t.charAt?posInfo.t:posInfo.t+"px"}if(posInfo.b){ret.bottom=posInfo.b.charAt?posInfo.b:posInfo.b+"px"}if(posInfo.r){ret.right=posInfo.r.charAt?posInfo.r:posInfo.r+"px"}if(posInfo.z){ret.zIndex=posInfo.z}return ret};_Fax.extractAndSealPosInfo=function(obj){if(!obj){return{}}return{width:obj.w!==undefined?obj.w.charAt?obj.w:obj.w+"px":undefined,height:obj.h!==undefined?obj.h.charAt?obj.h:obj.h+"px":undefined,left:obj.l!==undefined?obj.l.charAt?obj.l:obj.l+"px":undefined,top:obj.t!==undefined?obj.t.charAt?obj.t:obj.t+"px":undefined,bottom:obj.b!==undefined?(obj.b.charAt?obj.b:obj.b)+"px":undefined,right:obj.r!==undefined?obj.r.charAt?obj.r:obj.r+"px":undefined,zIndex:obj.z}};_Fax.newPosInfoRelativeTo=function(outer,inner){outer=outer||{};inner=inner||{};var ret={};if(inner.hasOwnProperty("left")){ret.left=inner.left.charAt?"noocompute%":inner.left+(outer.left||0)}else if(outer.hasOwnProperty("left")){ret.left=outer.left}if(inner.hasOwnProperty("top")){ret.top=inner.top.charAt?"noocompute%":inner.top+(outer.top||0)}else if(outer.hasOwnProperty("top")){ret.top=outer.top}if(inner.hasOwnProperty("bottom")){ret.bottom=inner.bottom.charAt?"noocompute%":inner.bottom+(outer.bottom||0)}else if(outer.hasOwnProperty("bottom")){ret.bottom=outer.bottom}if(inner.hasOwnProperty("right")){ret.right=inner.right.charAt?"noocompute%":inner.right+(outer.right||0)}else if(outer.hasOwnProperty("right")){ret.right=outer.right}if(inner.hasOwnProperty("width")){ret.width=inner.width}else if(outer.hasOwnProperty("width")){ret.width=outer.width}if(inner.hasOwnProperty("height")){ret.height=inner.height}else if(outer.hasOwnProperty("height")){ret.height=outer.height}if(inner.hasOwnProperty("z-index")){ret["z-index"]=inner["z-index"]+(outer["z-index"]||0)}else if(outer.hasOwnProperty("z-index")){ret["z-index"]=outer["z-index"]}return ret};_Fax.objMap=function(obj,fun){if(!obj){return obj}var ret={};var i=0;for(var key in obj){if(!obj.hasOwnProperty(key)){continue}ret[key]=fun(key,obj[key],i++)}return ret};var _objMapFilter=function(obj,fun,preFilter){var mapped;if(!obj){return obj}var ret={};for(var key in obj){if(!obj.hasOwnProperty(key)||preFilter&&preFilter[key]){continue}mapped=fun(key,obj[key]);if(mapped!==undefined){ret[key]=mapped}}return ret};if(typeof Fax==="object"){module.exports=Fax}else{Fax={_eventsById:FaxEvent.eventsById,curryOne:_curryOne,stringSwitch:_Fax.stringSwitch,MakeComponentClass:_Fax.MakeComponentClass,MakeDeepFreezeComponent:_Fax.MakeDeepFreezeComponent,Componentize:_Fax.Componentize,ComponentizeAll:_Fax.ComponentizeAll,forceClientRendering:true,renderAt:_Fax.renderAt,renderTopLevelComponentAt:_Fax.renderTopLevelComponentAt,registerTopLevelListener:_Fax.registerTopLevelListener,maybeInvoke:_Fax.maybeInvoke,str:_str,makeDomContainerComponent:_makeDomContainerComponent,allTruthy:_Fax.allTruthy,crossProduct:FaxUtils.crossProduct,extractCssPosInfo:_Fax.extractCssPosInfo,extractPosInfo:_Fax.extractPosInfo,sealPosInfo:_Fax.sealPosInfo,extractAndSealPosInfo:_Fax.extractAndSealPosInfo,newPosInfoRelativeTo:_Fax.newPosInfoRelativeTo,objMap:_Fax.objMap,objMapToArray:_Fax.objMapToArray,objMapFilter:_objMapFilter,arrayMapToObj:_Fax.arrayMapToObj,keys:_Fax.keys,keyCount:_Fax.keyCount,objSubset:_Fax.objSubset,exclusion:_Fax.exclusion,objExclusion:_Fax.objExclusion,using:_Fax.using,populateNamespace:null,copyProps:_Fax.copyProps,shallowClone:_Fax.shallowClone,sure:_sure,STRETCH:{top:0,left:0,right:0,bottom:0,position:"absolute"},onDomReadyDelegateQueue:[],postProjectionDelegateQueue:[],executeDomReadyQueue:_executeDomReadyQueue,executePostProjectionQueue:_executePostProjectionQueue,appendMarkup:_appendMarkup,singleDomNodeFromMarkup:_singleDomNodeFromMarkup,appendNode:_appendNode,insertNodeBeforeNode:_insertNodeBeforeNode,insertNodeAfterNode:_insertNodeAfterNode,clssMap:_clssMap,clssSet:_Fax.clssSet,fastClssMap:_fastClssMap,clssList:_clssList,merge:_Fax.merge,mergeThree:_Fax.mergeThree,mergeDeep:_Fax.mergeDeep,mergeStuff:_Fax.mergeStuff,mergeThis:_Fax.mergeThis,mergeReturn:_Fax.mergeReturn,multiComponentMixins:_Fax.multiComponentMixins,orderedComponentMixins:_Fax.orderedComponentMixins,multiDynamicComponentMixins:_Fax.multiDynamicComponentMixins,implicitChildrenRect:_Fax.implicitChildrenRect,getViewportDims:FaxUtils.getViewportDims,styleAttrNameForLogicalName:_styleAttrNameForLogicalName,serializeInlineStyle:_serializeInlineStyle,clone:_clone,POS_KEYS:{l:true,h:true,w:true,r:true,b:true,t:true},POS_CLSS_KEYS:{l:true,h:true,w:true,r:true,b:true,t:true,clssSet:true},TextNode:_Fax.TextNode};module.exports=Fax};
    }).call(module.exports);
    
    __require.modules["/node_modules/Fax/Fax.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/Fax/FaxUtils.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/Fax";
    var __filename = "/node_modules/Fax/FaxUtils.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/Fax");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/Fax");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/Fax/FaxUtils.js"]._cached = module.exports;
    
    (function () {
        module.exports={escapeTextNodeForBrowser:function(textNode){return textNode.text},getViewportDims:function(){var viewportwidth,viewportheight;if(typeof window.innerWidth!=="undefined"){return{viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}}else if(typeof document.documentElement!=="undefined"&&typeof document.documentElement.clientWidth!=="undefined"&&document.documentElement.clientWidth!==0){return{viewportWidth:document.documentElement.clientWidth,viewportHeight:document.documentElement.clientHeight}}else{return{viewportWidth:document.getElementsByTagName("body")[0].clientWidth,viewportHeight:document.getElementsByTagName("body")[0].clientHeight}}},createCookie:function(value,days){var expires,name="appCookie";if(days){var date=new Date;date.setTime(date.getTime()+days*24*60*60*1e3);expires="; expires="+date.toGMTString()}else{expires=""}document.cookie=name+"="+JSON.stringify(value)+expires+"; path=/";if(this._onCookieChange){this._onCookieChange()}},readCookie:function(){var name="appCookie";var nameEQ=name+"=";var ca=document.cookie.split(";");for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==" ")c=c.substring(1,c.length);if(c.indexOf(nameEQ)==0)return JSON.parse(c.substring(nameEQ.length,c.length))}return null},eraseCookie:function(){createCookie("appCookie","",-1)},_onCookieChange:null};
    }).call(module.exports);
    
    __require.modules["/node_modules/Fax/FaxUtils.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/Fax/FaxEvent.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/Fax";
    var __filename = "/node_modules/Fax/FaxEvent.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/Fax");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/Fax");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/Fax/FaxEvent.js"]._cached = module.exports;
    
    (function () {
        function AbstractEvent(abstractEventType,originatingTopLevelEventType,target,nativeEvent,data){this.abstractEventType=abstractEventType;this.originatingTopLevelEventType=originatingTopLevelEventType;this.target=target;this.nativeEvent=nativeEvent;this.data=data||{}}AbstractEvent.prototype.preventDefault=function(){if(this.nativeEvent.preventDefault){this.nativeEvent.preventDefault()}else{this.nativeEvent.returnValue=false}};var FaxEvent={activeDragHandlersByHandlerDesc:{},activeDragHandlersCount:0,activeDragDoneHandlersByHandlerDesc:{},activeDragDoneHandlersCount:0,startedDraggingAtX:null,startedDraggingAtY:null,lastTriggeredDragAtX:null,lastTriggeredDragAtY:null,listeningYet:false,abstractEventHandlersById:typeof FaxEvent==="object"?FaxEvent.abstractEventHandlersById:{},abstractHandlerNames:{},ensureListening:function(){if(!FaxEvent.listeningYet){FaxEvent.registerTopLevelListener();FaxEvent.listeningYet=true}},enqueueEventReg:function(id,listener){FaxEvent.abstractEventHandlersById[id+"@"+listener.listenForAbstractHandlerName]=listener},registerHandlerByName:function(domNodeId,propName,handler){if(FaxEvent.abstractHandlerNames[propName]){FaxEvent.enqueueEventReg(domNodeId,{listenForAbstractHandlerName:propName,callThis:handler})}},registerHandlers:function(domNodeId,props){for(var handlerName in FaxEvent.abstractHandlerNames){if(!FaxEvent.abstractHandlerNames.hasOwnProperty(handlerName)){continue}var handler=props[handlerName];if(handler){FaxEvent.enqueueEventReg(domNodeId,{listenForAbstractHandlerName:handlerName,callThis:handler})}}},__trapCapturedEvent:function(topLevelEventType,captureNativeEventType,onWhat){var ourHandler=function(eParam){var nativeEvent=eParam||window.event;var targ=nativeEvent.target||nativeEvent.srcElement;if(targ.nodeType===3){targ=targ.parentNode}_handleTopLevel(topLevelEventType,nativeEvent,targ)};if(!onWhat.addEventListener){onWhat.attachEvent(captureNativeEventType,ourHandler)}else{onWhat.addEventListener(captureNativeEventType,ourHandler,true)}},__trapBubbledEvent:function(topLevelEventType,windowHandlerName,onWhat){var ourHandler=function(eParam){var nativeEvent=eParam||window.event;var targ=nativeEvent.target||nativeEvent.srcElement;if(targ.nodeType===3){targ=targ.parentNode}_handleTopLevel(topLevelEventType,nativeEvent,targ)};if(onWhat[windowHandlerName]){onWhat[windowHandlerName]=function(nativeEvent){ourHandler(nativeEvent);onWhat[windowHandlerName](nativeEvent)}}else{onWhat[windowHandlerName]=function(nativeEvent){ourHandler(nativeEvent)}}},topLevelEventTypesDirectlyMappedToAbstractHandlerName:{topLevelClick:"onClick",topLevelMouseWheel:"onMouseWheel",topLevelMouseScroll:"onMouseScroll",topLevelKeyUp:"onKeyUp",topLevelKeyDown:"onKeyDown",topLevelKeyPress:"onKeyPress",topLevelFocus:"onFocus",topLevelBlur:"onBlur",topLevelMouseDown:"onMouseDown",topLevelTouchStart:"onTouchStart",topLevelMouseUp:"onMouseUp"},topLevelEventTypeHasCorrespondingAbstractType:function(topLevelEventType){return!!FaxEvent.topLevelEventTypesDirectlyMappedToAbstractHandlerName[topLevelEventType]},standardBubblingIteration:function(nextId,topLevelEventType,mode,nativeEvent,targ){var abstractEventHandlersById=FaxEvent.abstractEventHandlersById;var dragDesc=nextId+"@onQuantizeDrag"+mode;var somethingHandledThisLowLevelEvent=false;var abstractEvent;if(topLevelEventType==="topLevelMouseDown"&&abstractEventHandlersById[dragDesc]){abstractEvent=_constructAbstractEventDirectlyFromTopLevel(topLevelEventType,nativeEvent,targ);if(!abstractEvent.data.rightMouseButton){somethingHandledThisLowLevelEvent=true;var dragDoneDesc=nextId+"@onDragDone"+mode;var pageX=nativeEvent.pageX;var pageY=nativeEvent.pageY;FaxEvent.activeDragHandlersByHandlerDesc[dragDesc]=abstractEventHandlersById[dragDesc].callThis;FaxEvent.activeDragHandlersCount++;var activeDragDoneHandlerForNextId=abstractEventHandlersById[dragDoneDesc];if(activeDragDoneHandlerForNextId){FaxEvent.activeDragDoneHandlersByHandlerDesc[dragDoneDesc]=activeDragDoneHandlerForNextId.callThis;FaxEvent.activeDragDoneHandlersCount++}FaxEvent.startedDraggingAtX=pageX;FaxEvent.startedDraggingAtY=pageY;FaxEvent.lastTriggeredDragAtX=pageX;FaxEvent.lastTriggeredDragAtY=pageY}}if(FaxEvent.topLevelEventTypeHasCorrespondingAbstractType(topLevelEventType)){abstractEvent=typeof abstractEvent!=="undefined"?abstractEvent:_constructAbstractEventDirectlyFromTopLevel(topLevelEventType,nativeEvent,targ);var maybeEventListener=abstractEventHandlersById[nextId+"@"+abstractEvent.abstractEventType+mode];if(maybeEventListener){maybeEventListener.callThis(abstractEvent,nativeEvent);somethingHandledThisLowLevelEvent=true}}return somethingHandledThisLowLevelEvent},_isNativeClickEventRightClick:function(nativeEvent){return nativeEvent.which?nativeEvent.which==3:nativeEvent.button?nativeEvent.button==3:false},_normalizeAbstractMouseWheelEvent:function(event,target){var orgEvent=event,args,delta=0,deltaX=0,deltaY=0;event.type="mousewheel";if(event.wheelDelta){delta=event.wheelDelta/120}if(event.detail){delta=-event.detail/3}deltaY=delta;if(orgEvent.axis!==undefined&&orgEvent.axis===orgEvent.HORIZONTAL_AXIS){deltaY=0;deltaX=-1*delta}if(orgEvent.wheelDeltaY!==undefined){deltaY=orgEvent.wheelDeltaY/120}if(orgEvent.wheelDeltaX!==undefined){deltaX=-1*orgEvent.wheelDeltaX/120}return{delta:delta,deltaX:deltaX,deltaY:deltaY}},_normalizeAbstractScrollEvent:function(event,target){return{scrollTop:target.scrollTop,scrollLeft:target.scrollLeft,clientWidth:target.clientWidth,clientHeight:target.clientHeight,scrollHeight:target.scrollHeight,scrollWidth:target.scrollWidth}},_normalizeMouseData:function(event,target){return{globalX:event.clientX,globalY:event.clientY,rightMouseButton:FaxEvent._isNativeClickEventRightClick(event)}},_handleMouseInOut:function(topLevelEventType,nativeEvent,targ){var to=targ,from=targ,fromId="",toId="",abstractEventHandlersById=FaxEvent.abstractEventHandlersById;if(topLevelEventType==="topLevelMouseIn"){from=nativeEvent.relatedTarget||nativeEvent.fromElement;if(from){return}}else{to=nativeEvent.relatedTarget||nativeEvent.toElement}while(to&&(!to.id||to.id.charAt(0)!==".")){to=to.parentNode}while(from&&(!from.id||from.id.charAt(0)!==".")){from=from.parentNode}if(!from&&!to){return}if(from&&from.id){fromId=from.id}if(to&&to.id){toId=to.id}var commonIdx=0;var commonAncestorId="";var commonChars=0;while(toId.charAt(commonChars)!==""&&fromId.charAt(commonChars)!==""&&toId.charAt(commonChars)===fromId.charAt(commonChars)){commonChars++}if(toId.charAt(commonChars-1)==="."){commonAncestorId=toId.substr(0,commonChars-1)}else{commonAncestorId=toId.substr(0,toId.substr(0,commonChars).lastIndexOf("."))}var i,maybeEventListener,traverseId=fromId;if(from){i=0;while(traverseId!==commonAncestorId){maybeEventListener=abstractEventHandlersById[traverseId+"@onMouseOut"];if(maybeEventListener){maybeEventListener.callThis(new AbstractEvent("onMouseOut",topLevelEventType,nativeEvent,{}),targ,nativeEvent)}var oldtrav=traverseId;traverseId=traverseId.substr(0,traverseId.lastIndexOf("."));i++;if(i>200){FaxEvent.Error("Runaway tree: "+traverseId);return}}}traverseId=toId.substr(0,commonAncestorId.length);if(to){i=0;while(traverseId!==toId){traverseId=toId.indexOf(".",traverseId.length+1)===-1?toId:toId.substr(0,toId.indexOf(".",traverseId.length+1));maybeEventListener=abstractEventHandlersById[traverseId+"@onMouseIn"];if(maybeEventListener){maybeEventListener.callThis(new AbstractEvent("onMouseIn",topLevelEventType,nativeEvent,{}),targ,nativeEvent)}i++;if(i>200){FaxEvent.Error("Runaway tree: "+traverseId);return}}}return},_handleMouseMove:function(nativeEvent,targ){var SAMPLE_RATE=3;if(FaxEvent.activeDragHandlersCount){var pageX=nativeEvent.pageX;var pageY=nativeEvent.pageY;if(Math.abs(pageX-FaxEvent.lastTriggeredDragAtX)+Math.abs(pageY-FaxEvent.lastTriggeredDragAtY)<SAMPLE_RATE){return}for(var dragDesc in FaxEvent.activeDragHandlersByHandlerDesc){if(!FaxEvent.activeDragHandlersByHandlerDesc.hasOwnProperty(dragDesc)){continue}FaxEvent.activeDragHandlersByHandlerDesc[dragDesc](pageX,FaxEvent.startedDraggingAtX,pageY,FaxEvent.startedDraggingAtY)}FaxEvent.lastTriggeredDragAtX=pageX;FaxEvent.lastTriggeredDragAtY=pageY}},_handleMouseUp:function(nativeEvent,targ){var SAMPLE_RATE=3;var pageX=nativeEvent.pageX;var pageY=nativeEvent.pageY;if(FaxEvent.activeDragDoneHandlersCount){if(Math.abs(pageX-FaxEvent.startedDraggingAtX)+Math.abs(pageY-FaxEvent.startedDraggingAtY)>SAMPLE_RATE){for(var dragDoneDesc in FaxEvent.activeDragDoneHandlersByHandlerDesc){if(!FaxEvent.activeDragDoneHandlersByHandlerDesc.hasOwnProperty(dragDoneDesc)){continue}FaxEvent.activeDragDoneHandlersByHandlerDesc[dragDoneDesc]()}}}FaxEvent.activeDragHandlersByHandlerDesc={};FaxEvent.activeDragHandlersCount=0;FaxEvent.activeDragDoneHandlersCount=0;FaxEvent.activeDragDoneHandlersByHandlerDesc={};FaxEvent.startedDraggingAtX=0;FaxEvent.startedDraggingAtY=0}};var _eventModes=["","Direct","FirstHandler"];var _abstractHandlerBaseNames=["onTouchStart","onClick","onDragDone","onQuantizeDrag","onMouseWheel","onMouseScroll","onKeyUp","onKeyDown","onKeyPress","onFocus","onBlur","onMouseIn","onMouseOut","onMouseDown","onMouseUp"];for(var ei=0;ei<_eventModes.length;ei++){for(var hi=0;hi<_abstractHandlerBaseNames.length;hi++){FaxEvent.abstractHandlerNames[_abstractHandlerBaseNames[hi]+_eventModes[ei]]=true}}FaxEvent.registerTopLevelListener=function(){FaxEvent.__trapBubbledEvent("topLevelMouseMove","onmousemove",document);FaxEvent.__trapBubbledEvent("topLevelMouseIn","onmouseover",document);FaxEvent.__trapBubbledEvent("topLevelMouseDown","onmousedown",document);FaxEvent.__trapBubbledEvent("topLevelMouseUp","onmouseup",document);FaxEvent.__trapBubbledEvent("topLevelMouseOut","onmouseout",document);FaxEvent.__trapBubbledEvent("topLevelClick","onclick",document);FaxEvent.__trapBubbledEvent("topLevelMouseWheel","onmousewheel",document);FaxEvent.__trapBubbledEvent("topLevelKeyUp","onkeyup",document);FaxEvent.__trapBubbledEvent("topLevelKeyPress","onkeypress",document);FaxEvent.__trapBubbledEvent("topLevelKeyDown","onkeydown",document);FaxEvent.__trapCapturedEvent("topLevelTouchStart","touchstart",document);FaxEvent.__trapCapturedEvent("topLevelFocus","focus",window);FaxEvent.__trapCapturedEvent("topLevelBlur","blur",window);FaxEvent.__trapCapturedEvent("topLevelMouseWheel","DOMMouseScroll",document);FaxEvent.__trapCapturedEvent("topLevelMouseScroll","scroll",document)};function _constructAbstractEventDirectlyFromTopLevel(topLevelEventType,nativeEvent,target){var data;switch(topLevelEventType){case"topLevelMouseWheel":data=FaxEvent._normalizeAbstractMouseWheelEvent(nativeEvent,target);break;case"topLevelMouseScroll":data=FaxEvent._normalizeAbstractScrollEvent(nativeEvent,target);break;case"topLevelClick":case"topLevelMouseDown":case"topLevelMouseUp":data=FaxEvent._normalizeMouseData(nativeEvent,target);break;default:data={}}return new AbstractEvent(FaxEvent.topLevelEventTypesDirectlyMappedToAbstractHandlerName[topLevelEventType],topLevelEventType,target,nativeEvent,data)}function _handleTopLevel(topLevelEventType,nativeEvent,targ){var abstractEventHandlersById=FaxEvent.abstractEventHandlersById,nextId=targ.id;if(topLevelEventType==="topLevelMouseMove"){FaxEvent._handleMouseMove(nativeEvent,targ);return}if(topLevelEventType==="topLevelMouseUp"){FaxEvent._handleMouseUp(nativeEvent,targ);return}while(targ.parentNode&&targ.parentNode!==targ&&(nextId===null||nextId.length===0)){targ=targ.parentNode;nextId=targ.id}if(topLevelEventType==="topLevelMouseIn"||topLevelEventType==="topLevelMouseOut"){FaxEvent._handleMouseInOut(topLevelEventType,nativeEvent,targ);return}var handledYet=false;if(nextId&&nextId.length!==0){handledYet=FaxEvent.standardBubblingIteration(nextId,topLevelEventType,"Direct",nativeEvent,targ)}while(nextId&&nextId.length!==0){if(!handledYet){handledYet=FaxEvent.standardBubblingIteration(nextId,topLevelEventType,"FirstHandler",nativeEvent,targ)}handledYet=FaxEvent.standardBubblingIteration(nextId,topLevelEventType,"",nativeEvent,targ)||handledYet;var lastIndexDot=nextId.lastIndexOf(".");nextId=nextId.substr(0,lastIndexDot)}}module.exports=FaxEvent;
    }).call(module.exports);
    
    __require.modules["/node_modules/Fax/FaxEvent.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/FaxUi/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/FaxUi";
    var __filename = "/node_modules/FaxUi/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/FaxUi");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/FaxUi");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/FaxUi/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"FaxUi","description":"Declarative Base Components","url":"http://none.org","keywords":["fax","Fax","FaxUi","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./FaxUi","dependencies":{"Fax":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/FaxUi/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp";
    var __filename = "/node_modules/DemoApp/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"DemoApp","description":"Declarative Components","url":"http://none.org","keywords":["fax","Fax","DemoApp","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./DemoApp","dependencies":{"FaxUi":"0.0.1","Fax":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutDesigner";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutDesigner/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutDesigner");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutDesigner");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"LayoutDesigner","description":"Object presentation components","url":"http://none.org","keywords":["fax","Fax","LayoutDesigner","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./LayoutDesigner","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"FWidgets","description":"Declarative Components built on top of low level DOM","url":"http://none.org","keywords":["fax","FaxUi","Fax","FWidgets","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./FWidgets","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/FWidgets/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/FWidgets/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/FWidgets/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"FWidgets","description":"Declarative Components built on top of low level DOM","url":"http://none.org","keywords":["fax","FaxUi","Fax","FWidgets","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./FWidgets","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/FWidgets/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"ControlPanel","description":"Declarative Components","url":"http://none.org","keywords":["fax","Fax","FaxUi","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./ControlPanel","dependencies":{"FaxUi":"0.0.1","Fax":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"FWidgets","description":"Declarative Components built on top of low level DOM","url":"http://none.org","keywords":["fax","FaxUi","Fax","FWidgets","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./FWidgets","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"LayoutElements","description":"Object presentation components","url":"http://none.org","keywords":["fax","Fax","LayoutElements","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./LayoutElements","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutElements/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutElements";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutElements/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutElements");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutElements");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutElements/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"LayoutElements","description":"Object presentation components","url":"http://none.org","keywords":["fax","Fax","LayoutElements","ui","rendering","browser"],"author":"Jordo <jordofx@gmail.com>","contributors":[],"version":"0.0.1","main":"./LayoutElements","dependencies":{"Fax":"0.0.1","FaxUi":"0.0.1"},"engines":{"node":">=0.4.0"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutElements/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/LayoutElements.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/LayoutElements.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/LayoutElements.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),LayoutElements={},FaxUi=require("FaxUi");{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(LayoutElements,FaxUi)}LayoutElements.MaterialView={project:function(){return __NAMESPACE.FView({overrides:F.merge(this.props,this.props.overrides),clssSet:{texturedObject:true,texturedObjectLargeCorners:!!this.props.largeMode,texturedObjectSmallCorners:!this.props.largeMode},lighting:__NAMESPACE.FView({clssSet:{texturedObjectLighting:true,texturedObjectHighlightLighting:!!this.props.highlighted,texturedObjectStandardLighting:!this.props.highlighted,largerTexturedObjectLighting:!!this.props.largeMode,smallerTexturedObjectLighting:!this.props.largeMode}})})}};LayoutElements.MaterialButton={project:function(){return __NAMESPACE.MaterialView({overrides:this.props,highlighted:this.props.highlighted,buttonText:__NAMESPACE.Span({innerHtml:F.TextNode(this.props.text?this.props.text:"")})})}};LayoutElements.MaterialEmbedding={project:function(){var shouldUseLarge=this.props.embedded&&this.props.embedded.props.largeMode||this.props.largeMode;return __NAMESPACE.FView({overrides:this.props,clssSet:{largeEmbedding:shouldUseLarge,smallEmbedding:!shouldUseLarge}})}};LayoutElements.PhysicalButton={project:function(){return __NAMESPACE.ViewA({onClick:function(abstractEvent){abstractEvent.preventDefault()},clssSet:{buttonAnchor:true,texturedObject:true,smallerTexturedObject:true},overrides:F.objExclusion(this.props,{text:true}),href:F.TextNode("http://www.facebook.com"),physicalObject:__NAMESPACE.ViewDiv({lighting:__NAMESPACE.Div({clss:F.TextNode("abs texturedObjectLighting smallerTexturedObjectLighting")}),buttonText:__NAMESPACE.Span({innerHtml:F.TextNode(this.props.text)})})})}};LayoutElements.EmbeddedBorderView={project:function(){return __NAMESPACE.MaterialView({t:this.props.t,r:this.props.r,b:this.props.b,w:this.props.w,l:this.props.l,clssSet:this.props.clssSet,largeMode:true,embedding:__NAMESPACE.MaterialEmbedding({t:8,l:8,b:8,r:8,embeddedObject:__NAMESPACE.MaterialView({highlighted:true,overrides:F.objExclusion(this.props,F.POS_CLSS_KEYS)})})})}};module.exports=F.ComponentizeAll(LayoutElements);module.exports.styleExports={hovering:{boxShadow:FaxUi.stylers.boxShadowValue(0,15,15,0,0,0,.35)},texturedObject:{color:"rgb(230,230,230); color: rgba(250,250,250, .8)","text-shadow":"-1px 1px 1px rgba(0,0,0,.9)",fontSize:"13px",border:"1px solid black",backgroundImage:'url("/images/darkGrain.png")'},texturedObjectLargeCorners:{borderRadius:FaxUi.stylers.roundValue(4)},texturedObjectSmallCorners:{borderRadius:FaxUi.stylers.roundValue(3)},texturedObjectLighting:{borderTop:"1px solid rgba(255,255,255, .8)",borderRight:"1px solid rgba(180,180,180, .5)",borderLeft:"1px solid rgba(180,180,180, .5)",borderBottom:"none",left:0,right:0,top:0,bottom:0},texturedObjectStandardLighting:{opacity:.12,background:FaxUi.stylers.backgroundBottomUpGradientValue(15,15,15,90,170,170,170,90)},texturedObjectHighlightLighting:{opacity:.2,background:FaxUi.stylers.backgroundBottomUpGradientValue(100,100,100,90,170,170,170,90)},largerTexturedObjectLighting:{borderRadius:FaxUi.stylers.roundValue(4)},smallerTexturedObjectLighting:{borderRadius:FaxUi.stylers.roundValue(3)},buttonAnchor:{outline:0,"text-decoration":"none",display:"inline-block"},largeEmbedding:{backgroundColor:"rgb(10,10,10); background-color: rgba(10,10,10,.85)",borderBottom:"1px solid rgba(100,100,100, .25)",borderRadius:FaxUi.stylers.roundValue(4)},smallEmbedding:{backgroundColor:"rgb(10,10,10); background-color: rgba(10,10,10,.85)",borderBottom:"1px solid rgba(100,100,100, .25)",borderRadius:FaxUi.stylers.roundValue(3)}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/LayoutElements/LayoutElements.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutElements/LayoutElements.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutElements";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutElements/LayoutElements.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutElements");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutElements");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutElements/LayoutElements.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),LayoutElements={},FaxUi=require("FaxUi");{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(LayoutElements,FaxUi)}LayoutElements.MaterialView={project:function(){return __NAMESPACE.FView({overrides:F.merge(this.props,this.props.overrides),clssSet:{texturedObject:true,texturedObjectLargeCorners:!!this.props.largeMode,texturedObjectSmallCorners:!this.props.largeMode},lighting:__NAMESPACE.FView({clssSet:{texturedObjectLighting:true,texturedObjectHighlightLighting:!!this.props.highlighted,texturedObjectStandardLighting:!this.props.highlighted,largerTexturedObjectLighting:!!this.props.largeMode,smallerTexturedObjectLighting:!this.props.largeMode}})})}};LayoutElements.MaterialButton={project:function(){return __NAMESPACE.MaterialView({overrides:this.props,highlighted:this.props.highlighted,buttonText:__NAMESPACE.Span({innerHtml:F.TextNode(this.props.text?this.props.text:"")})})}};LayoutElements.MaterialEmbedding={project:function(){var shouldUseLarge=this.props.embedded&&this.props.embedded.props.largeMode||this.props.largeMode;return __NAMESPACE.FView({overrides:this.props,clssSet:{largeEmbedding:shouldUseLarge,smallEmbedding:!shouldUseLarge}})}};LayoutElements.PhysicalButton={project:function(){return __NAMESPACE.ViewA({onClick:function(abstractEvent){abstractEvent.preventDefault()},clssSet:{buttonAnchor:true,texturedObject:true,smallerTexturedObject:true},overrides:F.objExclusion(this.props,{text:true}),href:F.TextNode("http://www.facebook.com"),physicalObject:__NAMESPACE.ViewDiv({lighting:__NAMESPACE.Div({clss:F.TextNode("abs texturedObjectLighting smallerTexturedObjectLighting")}),buttonText:__NAMESPACE.Span({innerHtml:F.TextNode(this.props.text)})})})}};LayoutElements.EmbeddedBorderView={project:function(){return __NAMESPACE.MaterialView({t:this.props.t,r:this.props.r,b:this.props.b,w:this.props.w,l:this.props.l,clssSet:this.props.clssSet,largeMode:true,embedding:__NAMESPACE.MaterialEmbedding({t:8,l:8,b:8,r:8,embeddedObject:__NAMESPACE.MaterialView({highlighted:true,overrides:F.objExclusion(this.props,F.POS_CLSS_KEYS)})})})}};module.exports=F.ComponentizeAll(LayoutElements);module.exports.styleExports={hovering:{boxShadow:FaxUi.stylers.boxShadowValue(0,15,15,0,0,0,.35)},texturedObject:{color:"rgb(230,230,230); color: rgba(250,250,250, .8)","text-shadow":"-1px 1px 1px rgba(0,0,0,.9)",fontSize:"13px",border:"1px solid black",backgroundImage:'url("/images/darkGrain.png")'},texturedObjectLargeCorners:{borderRadius:FaxUi.stylers.roundValue(4)},texturedObjectSmallCorners:{borderRadius:FaxUi.stylers.roundValue(3)},texturedObjectLighting:{borderTop:"1px solid rgba(255,255,255, .8)",borderRight:"1px solid rgba(180,180,180, .5)",borderLeft:"1px solid rgba(180,180,180, .5)",borderBottom:"none",left:0,right:0,top:0,bottom:0},texturedObjectStandardLighting:{opacity:.12,background:FaxUi.stylers.backgroundBottomUpGradientValue(15,15,15,90,170,170,170,90)},texturedObjectHighlightLighting:{opacity:.2,background:FaxUi.stylers.backgroundBottomUpGradientValue(100,100,100,90,170,170,170,90)},largerTexturedObjectLighting:{borderRadius:FaxUi.stylers.roundValue(4)},smallerTexturedObjectLighting:{borderRadius:FaxUi.stylers.roundValue(3)},buttonAnchor:{outline:0,"text-decoration":"none",display:"inline-block"},largeEmbedding:{backgroundColor:"rgb(10,10,10); background-color: rgba(10,10,10,.85)",borderBottom:"1px solid rgba(100,100,100, .25)",borderRadius:FaxUi.stylers.roundValue(4)},smallEmbedding:{backgroundColor:"rgb(10,10,10); background-color: rgba(10,10,10,.85)",borderBottom:"1px solid rgba(100,100,100, .25)",borderRadius:FaxUi.stylers.roundValue(3)}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutElements/LayoutElements.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/FaxUi/FaxUi.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/FaxUi";
    var __filename = "/node_modules/FaxUi/FaxUi.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/FaxUi");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/FaxUi");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/FaxUi/FaxUi.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax");var _FaxUi={};var FaxUi={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi)}FaxUi.Div=F.makeDomContainerComponent("div");FaxUi.Label=F.makeDomContainerComponent("label");FaxUi.Ul=F.makeDomContainerComponent("ul");FaxUi.P=F.makeDomContainerComponent("p");FaxUi.Img=F.makeDomContainerComponent("img");FaxUi.A=F.makeDomContainerComponent("a");FaxUi.Li=F.makeDomContainerComponent("li");FaxUi.H1=F.makeDomContainerComponent("h1");FaxUi.H2=F.makeDomContainerComponent("h2");FaxUi.H3=F.makeDomContainerComponent("h3");FaxUi.H4=F.makeDomContainerComponent("h4");FaxUi.Span=F.makeDomContainerComponent("span");FaxUi.Input=F.makeDomContainerComponent("input");FaxUi.Button=F.makeDomContainerComponent("button");FaxUi.Table=F.makeDomContainerComponent("table");FaxUi.Tr=F.makeDomContainerComponent("tr");FaxUi.Td=F.makeDomContainerComponent("td");FaxUi.MakeTagView=function(NativeTagProjectingConstructor){return{project:function(){var props=this.props;var nativeTagProps;var overrides=props.overrides||{};var tagClssSet={tagClss:"abs nover hVStretch block "};if(props.clssSet||overrides.clssSet){tagClssSet=F.mergeThree(tagClssSet,props.clssSet,overrides.clssSet)}var nativeTagStyle=F.mergeThree(props.style,F.extractAndSealPosInfo(props),F.extractAndSealPosInfo(overrides));nativeTagProps=F.mergeThree(props,overrides,{clss:F.clssSet(tagClssSet),style:nativeTagStyle});delete nativeTagProps.overrides;delete nativeTagProps.clssSet;return NativeTagProjectingConstructor(nativeTagProps)}}};FaxUi.ViewDiv=FaxUi.MakeTagView(FaxUi.Div);FaxUi.ViewA=FaxUi.MakeTagView(FaxUi.A);FaxUi.ViewLabel=FaxUi.MakeTagView(FaxUi.Label);FaxUi.ViewUl=FaxUi.MakeTagView(FaxUi.Ul);FaxUi.ViewP=FaxUi.MakeTagView(FaxUi.P);FaxUi.ViewImg=FaxUi.MakeTagView(FaxUi.Img);FaxUi.ViewLi=FaxUi.MakeTagView(FaxUi.Li);FaxUi.ViewH1=FaxUi.MakeTagView(FaxUi.H1);FaxUi.ViewH2=FaxUi.MakeTagView(FaxUi.H2);FaxUi.ViewH3=FaxUi.MakeTagView(FaxUi.H3);FaxUi.ViewH4=FaxUi.MakeTagView(FaxUi.H4);FaxUi.ViewSpan=FaxUi.MakeTagView(FaxUi.Span);FaxUi.ViewInput=FaxUi.MakeTagView(FaxUi.Input);FaxUi.ViewButton=FaxUi.MakeTagView(FaxUi.Button);FaxUi.ViewTable=FaxUi.MakeTagView(FaxUi.Table);FaxUi.ViewTr=FaxUi.MakeTagView(FaxUi.Tr);FaxUi.ViewTd=FaxUi.MakeTagView(FaxUi.Td);FaxUi.FView=FaxUi.ViewDiv;_FaxUi.MultiConstructor=F.MakeComponentClass({},[F.multiComponentMixins]);FaxUi.Multi=function(propsParam){var props=propsParam||this;return{props:props,maker:_FaxUi.MultiConstructor}};_FaxUi.OrderedConstructor=F.MakeComponentClass({},[F.orderedComponentMixins]);FaxUi.Ordered=function(propsParam){var props=propsParam||this;return{props:props,maker:_FaxUi.OrderedConstructor}};_FaxUi.MultiDynamicConstructor=F.MakeComponentClass({},[F.multiDynamicComponentMixins]);FaxUi.MultiDynamic=function(propsParam){var props=propsParam||this;return{props:props,maker:_FaxUi.MultiDynamicConstructor}};module.exports=F.ComponentizeAll(FaxUi);module.exports.styleExports={hdn:{display:"none"},ib:{display:"inline-block"},abs:{margin:0,position:"absolute"},relZero:{position:"relative",left:0,right:0},vStretch:{position:"absolute",top:0,bottom:0},hStretch:{position:"absolute",left:0,right:0},hVStretch:{display:"block",padding:0,margin:0,position:"absolute",top:0,bottom:0,left:0,right:0},bottomFooter10:{position:"absolute",left:10,bottom:10,right:10},block:{display:"block"},nover:{"-ms-overflow-x":"hidden","-ms-overflow-y":"hidden",overflow:"hidden"},over:{"-ms-overflow-x":"visible","-ms-overflow-y":"visible",overflow:"visible"},pointer:{cursor:"pointer"},noSelect:{"-moz-user-select":"-moz-none","-webkit-user-select":"none","-khtml-user-select":"none","user-select":"none"}};function convertToHex(x){var CHAR_BANK="0123456789ABCDEF";x=parseInt(x,10);if(isNaN(x)){throw"Cannot convert non number to hex!"}x=Math.max(0,Math.min(x,255));return CHAR_BANK.charAt((x-x%16)/16)+CHAR_BANK.charAt(x%16)}var convertRgbToHex=function(R,G,B){return convertToHex(R)+convertToHex(G)+convertToHex(B)};var rgbaToFilterHex=function(R,G,B,A){return convertToHex(A*255)+convertToHex(R)+convertToHex(G)+convertToHex(B)};module.exports.stylers={boxSizingValue:function(val){return val+"; -moz-box-sizing:"+val+"; -webkit-box-sizing:"+val},roundValue:function(radiusParam){var radiusPx=(radiusParam||3)+"px";return radiusPx+"; -webkit-border-radius:"+radiusPx+"; -moz-border-radius:"+radiusPx},round:function(radiusParam){var radius=radiusParam||3;return{"border-radius":radius,"-webkit-border-radius":radius,"-moz-border-radius":radius}},roundTop:function(radiusParam){var radius=radiusParam||3;return{"border-radius-top-right":radius,"-webkit-border-top-right-radius":radius,"-moz-border-top-right-radius":radius,"border-radius-top-left":radius,"-webkit-border-top-left-radius":radius,"-moz-border-top-left-radius":radius}},roundBottom:function(radiusParam){var radius=radiusParam||3;return{"border-radius-bottom-right":radius,"-webkit-border-bottom-right-radius":radius,"-moz-border-bottom-right-radius":radius,"border-radius-bottom-left":radius,"-webkit-border-bottom-left-radius":radius,"-moz-border-bottom-left-radius":radius}},backgroundColorValue:function(rr,gg,bb,aa){var r=rr||0,g=gg||0,b=bb||0,a=aa||0;return"rgb("+r+","+g+","+b+"); background:rgba("+r+","+g+","+b+","+a+")"},boxShadowValue:function(a,b,c,d,e,f,al){return a+"px "+b+"px "+c+"px rgba("+d+","+e+","+f+","+al+");"+"-moz-box-shadow:"+a+"px "+b+"px "+c+"px rgba("+d+","+e+","+f+","+al+");"+"-webkit-box-shadow:"+a+"px "+b+"px "+c+"px rgba("+d+","+e+","+f+","+al+")"},backgroundBottomUpGradientValue:function(lR,lG,lB,lA,hR,hG,hB,hA){return"rgb("+lR+","+lG+","+lB+"); background:-moz-linear-gradient(top, rgba("+hR+","+hG+","+hB+","+hA+"), rgba("+lR+","+lG+","+lB+","+lA+")); background:-webkit-gradient("+"linear, left top, left bottom, from(rgba("+hR+","+hG+","+hB+","+hA+")), to(rgba("+lR+","+lG+","+lB+","+lA+'))); filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr="#'+rgbaToFilterHex(hR,hG,hB,hA)+'", EndColorStr="#'+rgbaToFilterHex(lR,lG,lB,lA)+'")'},backgroundBottomUpGradientValueFromMaps:function(lowMap,highMap){return module.exports.stylers.backgroundBottomUpGradientValue(lowMap.r,lowMap.g,lowMap.b,lowMap.a,highMap.r,highMap.g,highMap.b,highMap.a)},borderValue:function(color){return"solid 1px "+color},opacityValue:function(decimal){var msOpacity=""+decimal*100;return decimal+'; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity='+msOpacity+')";'+"filter: alpha(opacity="+msOpacity+")"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/FaxUi/FaxUi.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/LayoutDesigner.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutDesigner";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutDesigner/LayoutDesigner.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutDesigner");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutDesigner");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/LayoutDesigner.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),FWidgets=require("FWidgets"),LayoutDesigner={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,LayoutDesigner,FWidgets)}LayoutDesigner.Designer={};LayoutDesigner.Designer.initModel={hoveringShapeId:null,mapLeft:0,mapTop:0,drgX:0,drgY:0};LayoutDesigner.Designer.onSurfaceClick=function(abstractEvent){if(this.props.selectedTool==="pointerTool"){this.props.onMouseDownShapeId(null)}else if(this.props.selectedTool==="painterTool"){this.props.onPaint(abstractEvent,this.model.mapLeft,this.model.mapTop)}abstractEvent.preventDefault()};LayoutDesigner.Designer.onSurfaceDrag=function(x1,x0,y1,y0){if(this.props.selectedTool==="pointerTool"){this.updateModel({drgY:y1-y0,drgX:x1-x0})}};LayoutDesigner.Designer.onSurfaceDragDone=function(){var model=this.model;this.updateModel({mapLeft:model.mapLeft+model.drgX,mapTop:model.mapTop+model.drgY,drgX:0,drgY:0})};LayoutDesigner.Designer.project=function(){var model=this.model,props=this.props,ths=this;return __NAMESPACE.FView({onClickFirstHandler:this.onSurfaceClick.bind(this),onQuantizeDragFirstHandler:this.onSurfaceDrag.bind(this),onMouseIn:ths.updater({hoveringShapeId:null}),onDragDoneFirstHandler:this.onSurfaceDragDone.bind(this),shapes:__NAMESPACE.MultiDynamic(F.objMap(props.shapes,function(shapeId,obj,i){return __NAMESPACE.OwnedDesignerBox({l:obj.l+(obj.currentlyChanging.drgX||0)+(obj.currentlyChanging.left||0)+(model.mapLeft+model.drgX),t:obj.t+(obj.currentlyChanging.drgY||0)+(obj.currentlyChanging.top||0)+(model.mapTop+model.drgY),w:obj.w+(obj.currentlyChanging.right||0)+(-1*obj.currentlyChanging.left||0),h:obj.h+(-1*obj.currentlyChanging.top||0)+(obj.currentlyChanging.bottom||0),label:obj.name,selected:props.selectedShapeId===shapeId,onDragSignal:F.curryOne(props.onDragSignalShapeId,shapeId),onDragComplete:F.curryOne(props.onDragCompleteShapeId,shapeId),onResizeSignal:F.curryOne(props.onResizeSignalShapeId,shapeId),onResizeComplete:F.curryOne(props.onResizeCompleteShapeId,shapeId),onMouseDown:F.curryOne(props.onMouseDownShapeId,shapeId),onClick:function(){}})}))})};LayoutDesigner.OwnedDesignerBox={project:function(){F.sure(this.props,["onDragSignal","onDragComplete","onResizeSignal","onResizeComplete","l","t","w","h"]);var props=this.props,ths=this;return __NAMESPACE.ViewA({overrides:this.props,clssSet:{designerBox:true,selected:props.selected},onMouseDown:props.onMouseDown,onMouseIn:props.onMouseIn,onMouseOut:props.onMouseOut,onQuantizeDragFirstHandler:function(x1,x0,y1,y0){props.onDragSignal({drgX:x1-x0,drgY:y1-y0})},onDragDoneFirstHandler:props.onDragComplete,nameLabel:__NAMESPACE.ViewDiv({l:3,t:3,innerHtml:F.TextNode(props.label)}),rightDragger:__NAMESPACE.Div({clss:F.TextNode("noSelect designerBoxRightDragger"),onQuantizeDrag:function(x1,x0,y1,y0){props.onResizeSignal({right:x1-x0})},onDragDone:props.onResizeComplete}),topDragger:__NAMESPACE.Div({clss:F.TextNode("noSelect designerBoxTopDragger"),onQuantizeDrag:function(x1,x0,y1,y0){ths.props.onResizeSignal({top:y1-y0})},onDragDone:ths.props.onResizeComplete}),leftDragger:__NAMESPACE.Div({clss:F.TextNode("noSelect designerBoxLeftDragger"),onQuantizeDrag:function(x1,x0,y1,y0){ths.props.onResizeSignal({left:x1-x0})},onDragDone:ths.props.onResizeComplete}),bottomDragger:__NAMESPACE.Div({clss:F.TextNode("noSelect designerBoxBottomDragger"),onQuantizeDrag:function(x1,x0,y1,y0){ths.props.onResizeSignal({bottom:y1-y0})},onDragDone:ths.props.onResizeComplete})})}};module.exports=F.ComponentizeAll(LayoutDesigner);var CONSTS={controlPanelPadding:8};module.exports.styleExports={designerBox:{position:"absolute",boxShadow:FaxUi.stylers.boxShadowValue(-4,4,7,0,0,0,.2),borderRadius:FaxUi.stylers.roundValue(3),border:FaxUi.stylers.borderValue("#000"),background:FaxUi.stylers.backgroundBottomUpGradientValueFromMaps({r:40,g:40,b:40,a:255},{r:50,g:50,b:50,a:255})},selected:{color:"#73b2f9",boxShadow:FaxUi.stylers.boxShadowValue(-5,5,7,0,0,0,.3)},designerBoxRightDragger:{cursor:"e-resize",position:"absolute",top:0,right:-1,bottom:0,width:7},designerBoxLeftDragger:{cursor:"w-resize",position:"absolute",top:0,left:-1,bottom:0,width:7},designerBoxBottomDragger:{cursor:"s-resize",position:"absolute",left:0,right:0,bottom:-1,height:7},designerBoxTopDragger:{cursor:"n-resize",position:"absolute",top:-1,right:0,left:0,height:7}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/LayoutDesigner.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/ControlPanel.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/ControlPanel.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/ControlPanel.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),FWidgets=require("FWidgets"),LayoutElements=require("LayoutElements"),ControlPanel={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,ControlPanel,FWidgets,LayoutElements)}ControlPanel.ToolBox={project:function(){var props=this.props,ths=this,selectedShape=ths.props.selectedShape;return __NAMESPACE.Div({clss:F.TextNode("noSelect"),pointerToolButton:__NAMESPACE.MaterialButton({l:9,t:9,h:22,w:22,highlighted:props.selectedTool==="pointerTool",onClick:function(){props.onToolChange("pointerTool")},iconImage:__NAMESPACE.Img({clss:F.TextNode("buttonIcon"),src:F.TextNode("./images/pointer_icon.png")})}),painterToolButton:__NAMESPACE.MaterialButton({highlighted:props.selectedTool==="painterTool",l:34,t:9,w:22,h:22,b:"auto",onClick:function(){props.onToolChange("painterTool")},iconImage:__NAMESPACE.Img({clss:F.TextNode("buttonIcon"),src:F.TextNode("./images/plus_icon.png")})}),toolBoxEditorPanel:__NAMESPACE.FView({clssSet:{toolBoxEditorPanel:true},toolBoxRows:!selectedShape?null:__NAMESPACE.MultiDynamic({nameRow:__NAMESPACE.ToolBoxRow({value:selectedShape.name,attributeName:"name",label:"name",t:0,onAttributeChange:this.props.onAttributeChange}),leftRow:__NAMESPACE.ToolBoxRow({value:selectedShape.l,entryType:"int",attributeName:"l",label:"left",t:25,onAttributeChange:this.props.onAttributeChange}),topRow:__NAMESPACE.ToolBoxRow({value:selectedShape.t,entryType:"int",attributeName:"t",label:"top",t:50,onAttributeChange:this.props.onAttributeChange}),heightRow:__NAMESPACE.ToolBoxRow({value:selectedShape.w,entryType:"int",attributeName:"w",label:"width",t:75,onAttributeChange:this.props.onAttributeChange}),widthRow:__NAMESPACE.ToolBoxRow({value:selectedShape.h,entryType:"int",attributeName:"h",label:"height",t:100,onAttributeChange:this.props.onAttributeChange})})})})}};ControlPanel.ToolBoxRow={project:function(){var ths=this;return __NAMESPACE.FView({overrides:F.objExclusion(this.props,{isNumeric:true,label:true,value:true,attributeName:true}),clssSet:{abs:true},leftLabel:__NAMESPACE.ViewDiv({style:{left:0,width:50},innerHtml:F.TextNode(this.props.label)}),rightInput:__NAMESPACE.FInputView({l:50,r:0,t:0,b:0,h:22,additionalClssSet:{toolBoxRowInput:true},value:this.props.value,entryType:this.props.entryType,onBlur:function(newVal){ths.props.onAttributeChange(ths.props.attributeName,newVal)}})})}};module.exports=F.ComponentizeAll(ControlPanel);module.exports.styleExports={toolBoxEditorPanel:{bottom:9,left:9,right:9,top:40},buttonIcon:{position:"absolute",height:16,width:16,left:3,top:3},toolBoxRowInput:{color:"#000",fontSize:"13px",backgroundColor:"#888",position:"absolute",left:50,right:0,top:0,bottom:0,border:"1px solid #222"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/ControlPanel.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/FWidgets/FWidgets.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/FWidgets/FWidgets.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),FWidgets={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,FWidgets)}var CONSTS={generalHorzPadding:5,FInputBgColor:"#fff",FInputTotalHeight:26,FInputFontSize:14,FInputFontColor:"#444",FInputFontColorPlaceheld:"#aaa",FInputBorderColor:"#b8b8b8",FInputBorderRadius:2,FButtonTotalHeight:26,FButtonFontSize:14,FButtonFontColor:"#888",FButtonFontColorActive:"#333",FButtonBorderColor:"#b8b8b8",FBUttonBorderColorActive:"#888",FButtonBorderRadius:2,FButtonBgColor:"#f1f1f1",FButtonBgColorBottom:"#F4F4F4",FButtonBgColorTop:"#F0F0F0"};FWidgets.EntryTypes={numeric:1,"int":2,str:3};FWidgets.FInputView={initModel:function(){return{focused:false,userText:this.externallyOwned()?this.props.value:""}},externallyOwned:function(){return this.props.value!==undefined},onKeyDown:function(abstractEvent){var nativeEvent=abstractEvent.nativeEvent,keyCode=nativeEvent.keyCode;if(this.props.entryType==="int"&&keyCode===190){abstractEvent.preventDefault()}else if((this.props.entryType==="numeric"||this.props.entryType==="int")&&(keyCode<48||keyCode>57)&&keyCode!==13&&keyCode!==8&&keyCode!==9&&(keyCode<37||keyCode>39)){abstractEvent.preventDefault()}if(this.props.onEnter&&nativeEvent.keyCode===13){this.props.onEnter()}},onKeyUp:function(abstractEvent){var val=abstractEvent.target.value;if(this.model.userText!==val){if(!this.externallyOwned()){this.justUpdateModel({userText:val})}else{if(this.props.onChange){this.props.onChange(val)}}}},onBlur:function(abstractEvent){this.justUpdateModel({focused:true});this.props.onBlur&&this.props.onBlur(abstractEvent.nativeEvent.target.value)},project:function(){var props=this.props,model=this.model,style=props.style||{};var intendedText=this.externallyOwned()?props.value:model.userText;var placeHeld=!intendedText&&!model.focused;var textToShow=placeHeld&&props.placeholder?props.placeholder:intendedText!==null&&intendedText!==null?intendedText:"";return __NAMESPACE.ViewInput({overrides:{clssSet:this.props.additionalClssSet,posInfo:F.extractPosInfo(this.props)},clssSet:{FInput:true,FInputSuper:!!props.superMode,FInputPlaceheld:!!placeHeld,userSuppliedClass:props.clss},type:F.TextNode(!props.secure||placeHeld?"text":"password"),value:F.TextNode(textToShow),onKeyDown:this.onKeyDown.bind(this),onKeyUp:this.onKeyUp.bind(this),onBlur:this.onBlur.bind(this),onFocus:this.updater({focused:true})})}};(FWidgets.FAbsInput={}).project=function(){return __NAMESPACE.FView({clssSet:{abs:true},overrides:F.objSubset(this.props,F.POS_KEYS),contained:__NAMESPACE.FInputView({w:"100%",overrides:F.objExclusion(this.props,F.POS_KEYS)})})};(FWidgets.FButton={}).project=function(){return __NAMESPACE.ViewA({overrides:this.props,clssSet:{FButton:true}})};module.exports=F.ComponentizeAll(FWidgets);module.exports.CONSTS=CONSTS;module.exports.styleExports={FInput:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",backgroundColor:CONSTS.FInputBgColor,margin:0,display:"inline-block",paddingTop:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingBottom:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingLeft:5,paddingRight:5,height:CONSTS.FInputFontSize,border:"solid 1px "+CONSTS.FInputBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FInputBorderRadius),color:CONSTS.FInputFontColor,fontWeight:"normal",fontSize:CONSTS.FInputFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s"},FInputPlaceheld:{color:CONSTS.FInputFontColorPlaceheld},FInputSuper:{fontWeight:"bold"},".FInputSuper:focus":{boxShadow:FaxUi.stylers.boxShadowValue(0,0,8,0,0,250,.2)},FButton:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",textAlign:"center",outline:0,backgroundColor:CONSTS.FButtonBgColor,textDecoration:"none",display:"inline-block",margin:0,paddingTop:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2-2,paddingBottom:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2+2,paddingLeft:5,paddingRight:5,height:CONSTS.FButtonFontSize,border:"solid 1px "+CONSTS.FButtonBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FButtonBorderRadius),color:CONSTS.FButtonFontColor,fontWeight:"bold",fontSize:CONSTS.FButtonFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s; transition: border-color: .25s",background:"-webkit-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"));"+"background: -moz-linear-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"))"},".FButton:hover, .FButton:focus":{outline:0,color:CONSTS.FButtonFontColorActive,borderColor:CONSTS.FBUttonBorderColorActive,boxShadow:FaxUi.stylers.boxShadowValue(0,1,2,0,0,0,.15)}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/FWidgets.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/FWidgets.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),FWidgets={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,FWidgets)}var CONSTS={generalHorzPadding:5,FInputBgColor:"#fff",FInputTotalHeight:26,FInputFontSize:14,FInputFontColor:"#444",FInputFontColorPlaceheld:"#aaa",FInputBorderColor:"#b8b8b8",FInputBorderRadius:2,FButtonTotalHeight:26,FButtonFontSize:14,FButtonFontColor:"#888",FButtonFontColorActive:"#333",FButtonBorderColor:"#b8b8b8",FBUttonBorderColorActive:"#888",FButtonBorderRadius:2,FButtonBgColor:"#f1f1f1",FButtonBgColorBottom:"#F4F4F4",FButtonBgColorTop:"#F0F0F0"};FWidgets.EntryTypes={numeric:1,"int":2,str:3};FWidgets.FInputView={initModel:function(){return{focused:false,userText:this.externallyOwned()?this.props.value:""}},externallyOwned:function(){return this.props.value!==undefined},onKeyDown:function(abstractEvent){var nativeEvent=abstractEvent.nativeEvent,keyCode=nativeEvent.keyCode;if(this.props.entryType==="int"&&keyCode===190){abstractEvent.preventDefault()}else if((this.props.entryType==="numeric"||this.props.entryType==="int")&&(keyCode<48||keyCode>57)&&keyCode!==13&&keyCode!==8&&keyCode!==9&&(keyCode<37||keyCode>39)){abstractEvent.preventDefault()}if(this.props.onEnter&&nativeEvent.keyCode===13){this.props.onEnter()}},onKeyUp:function(abstractEvent){var val=abstractEvent.target.value;if(this.model.userText!==val){if(!this.externallyOwned()){this.justUpdateModel({userText:val})}else{if(this.props.onChange){this.props.onChange(val)}}}},onBlur:function(abstractEvent){this.justUpdateModel({focused:true});this.props.onBlur&&this.props.onBlur(abstractEvent.nativeEvent.target.value)},project:function(){var props=this.props,model=this.model,style=props.style||{};var intendedText=this.externallyOwned()?props.value:model.userText;var placeHeld=!intendedText&&!model.focused;var textToShow=placeHeld&&props.placeholder?props.placeholder:intendedText!==null&&intendedText!==null?intendedText:"";return __NAMESPACE.ViewInput({overrides:{clssSet:this.props.additionalClssSet,posInfo:F.extractPosInfo(this.props)},clssSet:{FInput:true,FInputSuper:!!props.superMode,FInputPlaceheld:!!placeHeld,userSuppliedClass:props.clss},type:F.TextNode(!props.secure||placeHeld?"text":"password"),value:F.TextNode(textToShow),onKeyDown:this.onKeyDown.bind(this),onKeyUp:this.onKeyUp.bind(this),onBlur:this.onBlur.bind(this),onFocus:this.updater({focused:true})})}};(FWidgets.FAbsInput={}).project=function(){return __NAMESPACE.FView({clssSet:{abs:true},overrides:F.objSubset(this.props,F.POS_KEYS),contained:__NAMESPACE.FInputView({w:"100%",overrides:F.objExclusion(this.props,F.POS_KEYS)})})};(FWidgets.FButton={}).project=function(){return __NAMESPACE.ViewA({overrides:this.props,clssSet:{FButton:true}})};module.exports=F.ComponentizeAll(FWidgets);module.exports.CONSTS=CONSTS;module.exports.styleExports={FInput:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",backgroundColor:CONSTS.FInputBgColor,margin:0,display:"inline-block",paddingTop:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingBottom:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingLeft:5,paddingRight:5,height:CONSTS.FInputFontSize,border:"solid 1px "+CONSTS.FInputBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FInputBorderRadius),color:CONSTS.FInputFontColor,fontWeight:"normal",fontSize:CONSTS.FInputFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s"},FInputPlaceheld:{color:CONSTS.FInputFontColorPlaceheld},FInputSuper:{fontWeight:"bold"},".FInputSuper:focus":{boxShadow:FaxUi.stylers.boxShadowValue(0,0,8,0,0,250,.2)},FButton:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",textAlign:"center",outline:0,backgroundColor:CONSTS.FButtonBgColor,textDecoration:"none",display:"inline-block",margin:0,paddingTop:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2-2,paddingBottom:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2+2,paddingLeft:5,paddingRight:5,height:CONSTS.FButtonFontSize,border:"solid 1px "+CONSTS.FButtonBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FButtonBorderRadius),color:CONSTS.FButtonFontColor,fontWeight:"bold",fontSize:CONSTS.FButtonFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s; transition: border-color: .25s",background:"-webkit-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"));"+"background: -moz-linear-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"))"},".FButton:hover, .FButton:focus":{outline:0,color:CONSTS.FButtonFontColorActive,borderColor:CONSTS.FBUttonBorderColorActive,boxShadow:FaxUi.stylers.boxShadowValue(0,1,2,0,0,0,.15)}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/LayoutDesigner/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/FWidgets.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets";
    var __filename = "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/FWidgets.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),FWidgets={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,FWidgets)}var CONSTS={generalHorzPadding:5,FInputBgColor:"#fff",FInputTotalHeight:26,FInputFontSize:14,FInputFontColor:"#444",FInputFontColorPlaceheld:"#aaa",FInputBorderColor:"#b8b8b8",FInputBorderRadius:2,FButtonTotalHeight:26,FButtonFontSize:14,FButtonFontColor:"#888",FButtonFontColorActive:"#333",FButtonBorderColor:"#b8b8b8",FBUttonBorderColorActive:"#888",FButtonBorderRadius:2,FButtonBgColor:"#f1f1f1",FButtonBgColorBottom:"#F4F4F4",FButtonBgColorTop:"#F0F0F0"};FWidgets.EntryTypes={numeric:1,"int":2,str:3};FWidgets.FInputView={initModel:function(){return{focused:false,userText:this.externallyOwned()?this.props.value:""}},externallyOwned:function(){return this.props.value!==undefined},onKeyDown:function(abstractEvent){var nativeEvent=abstractEvent.nativeEvent,keyCode=nativeEvent.keyCode;if(this.props.entryType==="int"&&keyCode===190){abstractEvent.preventDefault()}else if((this.props.entryType==="numeric"||this.props.entryType==="int")&&(keyCode<48||keyCode>57)&&keyCode!==13&&keyCode!==8&&keyCode!==9&&(keyCode<37||keyCode>39)){abstractEvent.preventDefault()}if(this.props.onEnter&&nativeEvent.keyCode===13){this.props.onEnter()}},onKeyUp:function(abstractEvent){var val=abstractEvent.target.value;if(this.model.userText!==val){if(!this.externallyOwned()){this.justUpdateModel({userText:val})}else{if(this.props.onChange){this.props.onChange(val)}}}},onBlur:function(abstractEvent){this.justUpdateModel({focused:true});this.props.onBlur&&this.props.onBlur(abstractEvent.nativeEvent.target.value)},project:function(){var props=this.props,model=this.model,style=props.style||{};var intendedText=this.externallyOwned()?props.value:model.userText;var placeHeld=!intendedText&&!model.focused;var textToShow=placeHeld&&props.placeholder?props.placeholder:intendedText!==null&&intendedText!==null?intendedText:"";return __NAMESPACE.ViewInput({overrides:{clssSet:this.props.additionalClssSet,posInfo:F.extractPosInfo(this.props)},clssSet:{FInput:true,FInputSuper:!!props.superMode,FInputPlaceheld:!!placeHeld,userSuppliedClass:props.clss},type:F.TextNode(!props.secure||placeHeld?"text":"password"),value:F.TextNode(textToShow),onKeyDown:this.onKeyDown.bind(this),onKeyUp:this.onKeyUp.bind(this),onBlur:this.onBlur.bind(this),onFocus:this.updater({focused:true})})}};(FWidgets.FAbsInput={}).project=function(){return __NAMESPACE.FView({clssSet:{abs:true},overrides:F.objSubset(this.props,F.POS_KEYS),contained:__NAMESPACE.FInputView({w:"100%",overrides:F.objExclusion(this.props,F.POS_KEYS)})})};(FWidgets.FButton={}).project=function(){return __NAMESPACE.ViewA({overrides:this.props,clssSet:{FButton:true}})};module.exports=F.ComponentizeAll(FWidgets);module.exports.CONSTS=CONSTS;module.exports.styleExports={FInput:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",backgroundColor:CONSTS.FInputBgColor,margin:0,display:"inline-block",paddingTop:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingBottom:(CONSTS.FInputTotalHeight-2-CONSTS.FInputFontSize)/2,paddingLeft:5,paddingRight:5,height:CONSTS.FInputFontSize,border:"solid 1px "+CONSTS.FInputBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FInputBorderRadius),color:CONSTS.FInputFontColor,fontWeight:"normal",fontSize:CONSTS.FInputFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s"},FInputPlaceheld:{color:CONSTS.FInputFontColorPlaceheld},FInputSuper:{fontWeight:"bold"},".FInputSuper:focus":{boxShadow:FaxUi.stylers.boxShadowValue(0,0,8,0,0,250,.2)},FButton:{boxSizing:"content-box","-moz-box-sizing":"content-box","-webkit-box-sizing":"content-box",textAlign:"center",outline:0,backgroundColor:CONSTS.FButtonBgColor,textDecoration:"none",display:"inline-block",margin:0,paddingTop:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2-2,paddingBottom:(CONSTS.FButtonTotalHeight-2-CONSTS.FButtonFontSize)/2+2,paddingLeft:5,paddingRight:5,height:CONSTS.FButtonFontSize,border:"solid 1px "+CONSTS.FButtonBorderColor,borderRadius:FaxUi.stylers.roundValue(CONSTS.FButtonBorderRadius),color:CONSTS.FButtonFontColor,fontWeight:"bold",fontSize:CONSTS.FButtonFontSize,"-webkit-transition":"box-shadow .25s","-moz-transition":"-moz-box-shadow .25s",transition:"box-shadow .25s; transition: border-color: .25s",background:"-webkit-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"));"+"background: -moz-linear-gradient(linear,0% 40%,0% 70%,from("+CONSTS.FButtonBgColorBottom+"),to("+CONSTS.FButtonBgColorBottom+"))"},".FButton:hover, .FButton:focus":{outline:0,color:CONSTS.FButtonFontColorActive,borderColor:CONSTS.FBUttonBorderColorActive,boxShadow:FaxUi.stylers.boxShadowValue(0,1,2,0,0,0,.15)}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/node_modules/ControlPanel/node_modules/FWidgets/FWidgets.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/DemoApp/DemoApp.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/DemoApp";
    var __filename = "/node_modules/DemoApp/DemoApp.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/DemoApp");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/DemoApp");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/DemoApp/DemoApp.js"]._cached = module.exports;
    
    (function () {
        var F=require("Fax"),FaxUi=require("FaxUi"),LayoutDesigner=require("LayoutDesigner"),FWidgets=require("FWidgets"),ControlPanel=require("ControlPanel"),LayoutElements=require("LayoutElements"),DemoApp={};{var __NAMESPACE={};require("Fax").populateNamespace=__NAMESPACE;F.using(FaxUi,DemoApp,LayoutDesigner,ControlPanel,FWidgets,LayoutElements)}var CONSTS={drawingOffsetL:82,drawingOffsetT:39};DemoApp.DemoAppContent={initModel:{selectedTool:"pointerTool",selectedShapeId:"box1",shapes:{box0:{name:"box1",l:200,t:100,w:100,h:100,drgX:0,drgY:0,currentlyChanging:{}},box1:{name:"box2",l:20,t:100,w:100,h:100,drgX:0,drgY:0,currentlyChanging:{}},box2:{name:"box3",l:50,t:190,w:170,h:100,drgX:0,drgY:0,currentlyChanging:{}}}},project:function(){var ths=this;return __NAMESPACE.FView({l:0,t:0,b:0,r:0,clssSet:{noSelect:true,appContent:true},designerPanel:__NAMESPACE.EmbeddedBorderView({l:30,t:30,r:250,b:30,clssSet:{shadowy:true},content:__NAMESPACE.Designer({onPaint:this.onPaint.bind(this),selectedTool:ths.model.selectedTool,shapes:ths.model.shapes,selectedShapeId:this.model.selectedShapeId,onMouseDownShapeId:this.onMouseDownShapeId.bind(this),onDragSignalShapeId:this.onDragSignalShapeId.bind(this),onDragCompleteShapeId:this.onDragCompleteShapeId.bind(this),onResizeSignalShapeId:this.onResizeSignalShapeId.bind(this),onResizeCompleteShapeId:this.onResizeCompleteShapeId.bind(this)})}),controlPanel:__NAMESPACE.EmbeddedBorderView({clssSet:{shadowy:true},l:"auto",r:30,t:30,w:200,b:30,content:__NAMESPACE.ToolBox({onToolChange:function(newTool){ths.updateModel({selectedTool:newTool})},selectedTool:ths.model.selectedTool,selectedShape:ths.model.shapes[ths.model.selectedShapeId],onAttributeChange:function(attributeName,newValStr){if(ths.model.selectedShapeId){var val=isNaN(parseInt(newValStr,"10"))?newValStr:parseInt(newValStr,10);ths.model.shapes[ths.model.selectedShapeId][attributeName]=val;ths.updateModel({})}}})})})},onPaint:function(abstractEvent,mapLeftOffset,mapTopOffset){var updateBlock={shapes:{}};updateBlock.shapes[""+Math.random()]={name:"block",l:abstractEvent.data.globalX-CONSTS.drawingOffsetL-mapLeftOffset,t:abstractEvent.data.globalY-CONSTS.drawingOffsetT-mapTopOffset,w:100,h:100,drgX:0,drgY:0,currentlyChanging:{}};this.updateModelDeep(updateBlock)},onMouseDownShapeId:function(shapeId){this.updateModel({selectedShapeId:shapeId})},onDragSignalShapeId:function(shapeId,plan){var updateBlock={shapes:{}};updateBlock.shapes[shapeId]={currentlyChanging:plan};this.updateModelDeep(updateBlock)},onDragCompleteShapeId:function(shapeId){var obj=this.model.shapes[shapeId],updateBlock={shapes:{}};updateBlock.shapes[shapeId]={l:obj.l+obj.currentlyChanging.drgX,t:obj.t+obj.currentlyChanging.drgY,currentlyChanging:{drgX:0,drgY:0}};this.updateModelDeep(updateBlock)},onResizeSignalShapeId:function(shapeId,plan){this.model.shapes[shapeId].currentlyChanging=plan;this.updateModel({})},onResizeCompleteShapeId:function(shapeId){var obj=this.model.shapes[shapeId],updateBlock={shapes:{}};updateBlock.shapes[shapeId]={w:obj.w+(obj.currentlyChanging.right||0)+(-1*obj.currentlyChanging.left||0),l:obj.l+(obj.currentlyChanging.left||0),h:obj.h+(-1*obj.currentlyChanging.top||0)+(obj.currentlyChanging.bottom||0),t:obj.t+(obj.currentlyChanging.top||0),currentlyChanging:{}};this.model.shapes[shapeId].currentlyChanging=null;this.updateModelDeep(updateBlock)}};DemoApp.MainDemoApp={initModel:{selectedSection:"settings"},project:function(){return __NAMESPACE.FView({appContent:__NAMESPACE.DemoAppContent(DemoApp)})}};module.exports=F.ComponentizeAll(DemoApp);module.exports.styleExports={"#appMount":{backgroundImage:'url("/images/lightWood.png")'},shadowy:{boxShadow:FaxUi.stylers.boxShadowValue(0,15,18,0,0,0,.3)},appContent:{position:"absolute",left:0,right:0,top:0,bottom:0}};
    }).call(module.exports);
    
    __require.modules["/node_modules/DemoApp/DemoApp.js"]._cached = module.exports;
    return module.exports;
};
