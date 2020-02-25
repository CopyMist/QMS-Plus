// ==UserScript==
// @name         QMS Plus
// @namespace    4PDA
// @version      0.5
// @description  Юзерскрипт для добавления/исправления функционала QMS на форуме 4PDA
// @author       CopyMist
// @license      https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ru
// @icon         https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/icon-128.png
// @homepage     https://4pda.ru/forum/index.php?showforum=5
// @match        https://4pda.ru/forum/*act=qms*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.min.js
// @resource     backgroundSvg https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/background.svg
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global $ */

/*
 * Стили
 */

var cssCode = [
    '.body-tbl svg { height: 100%; padding: 1%; }',
    '.chk-wrap { display: flex; align-items: center; }',
    '.chk-wrap .chk-left { width: 13px; height: 13px; margin: 1px 0 0 20px; }',
    '.chk-wrap .chk-right { display: block; padding: 3px 20px 3px 7px; white-space: nowrap; }',
    '.dropdown-menu > li > a:hover, .chk-wrap:hover { background-color: #E4EAF2; }',
    '.chk-wrap > input:hover, .chk-wrap > label:hover { cursor: pointer; }'
].join('\n');

GM_addStyle(cssCode);

/*
 * Функции
 */

function optionHtml(name, title) {
    return ''+
        '<div class="chk-wrap clearfix">' +
        '<input class="checkbox chk-left" type="checkbox" name="' + name + '" value="1" id="' + name + '" checked="checked">' +
        '<label class="chk-right" for="' + name + '">' + title + '</label>' +
        '</div>';
}

/*
 * Глобальные переменные
 */

var bgSvg = GM_getResourceText('backgroundSvg');
var settingsHtml = '' +
    '<div class="dropdown" id="qms-plus">' +
    '<a href="#" class="btn" title="Настройки QMS Plus" data-toggle="dropdown">' +
    '<i class="icon-cog"></i><span class="on-show-sidebar">Настройки QMS Plus</span><i class="icon-down-dir-1"></i>' +
    '</a>' +
    '<ul class="dropdown-menu pull-right">' +
    optionHtml('hide-header', 'Скрыть шапку (header)') +
    optionHtml('hide-footer', 'Скрыть подвал (footer)') +
    '</ul>' +
    '</div> &nbsp;';

/*
 * Действия до document.ready
 */

// Замена SVG-смайлика на свой фон "QMS Plus"
$('.body-tbl svg').replaceWith(bgSvg);
$('#body').arrive('.body-tbl', function() {
    $('.body-tbl svg').replaceWith(bgSvg);
});

// Добавление дропдауна "Настройки QMS Plus"
$('.nav-right > .dropdown').before(settingsHtml);
$('#body').arrive('.navbar', function() {
    if (!$('#qms-plus').length) {
        $('.nav-right > .dropdown').before(settingsHtml);
    }
});

/*
 * Действия после document.ready
 */

$(function () {
    //$('.nav-right > .dropdown').before(settingsHtml);
});