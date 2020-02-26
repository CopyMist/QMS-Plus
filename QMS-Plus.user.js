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
// @require      https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.1/umd/popper.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tippy.js/5.2.1/tippy-bundle.iife.min.js
// @resource     backgroundSvg https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/background.svg
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global $, tippy */

/*
 * Стили
 */

var cssCode = [
    '.body-tbl svg { height: 100%; padding: 1%; }',
    '.chk-wrap { display: flex; align-items: center; }',
    '.chk-wrap .chk-left { width: 13px; height: 13px; margin: 1px 0 0 20px; }',
    '.chk-wrap .chk-right { display: block; padding: 3px 20px 3px 7px; white-space: nowrap; }',
    '.dropdown-menu > li > a:hover, .chk-wrap:hover { background-color: #E4EAF2; }',
    '.chk-wrap > input:hover, .chk-wrap > label:hover { cursor: pointer; }',
    '.tippy-tooltip { background-color: #eaf4ff; color: #4373c3; font-weight: bold; }',
    '.tippy-tooltip[data-placement^=top]>.tippy-arrow { border-top-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=bottom]>.tippy-arrow { border-bottom-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=left]>.tippy-arrow { border-left-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=right]>.tippy-arrow { border-right-color: #eaf4ff; }',
    'body.hide-header .holder-no-hidden, body.hide-header .menu-main-mobile { display: none; }',
    'body.hide-header .navbar { top: 0; }',
    'body.hide-header .header { height: 42px; max-height: 42px; }',
    'body.hide-header #contacts, body.hide-header #body { top: 42px; }',
    'body.hide-footer .footer { display: none; }',
    'body.hide-footer #contacts, body.hide-footer #body { bottom: 0; }'
].join('\n');
GM_addStyle(cssCode);

/*
 * Функции
 */

function optionHtml(name, title, checked) {
    var result = '<div class="chk-wrap clearfix">' +
        '<input class="checkbox chk-left" type="checkbox" name="' + name + '" value="1" id="' + name + '"';

    if (checked) {
        result+=' checked="checked"';
    }

    result+='><label class="chk-right" for="' + name + '">' + title + '</label></div>';
    return result;
}

/*
 * Глобальные переменные
 */

var options = GM_getValue('options');
if (!options) {
    options = {
        'hide-header': true,
        'hide-footer': true
    };
    GM_setValue('options', options);
}

var bgSvg = GM_getResourceText('backgroundSvg');
var settingsHtml = '' +
    '<div class="dropdown" id="qms-plus">' +
    '<a href="#" class="btn" title="Настройки QMS Plus" data-toggle="dropdown">' +
    '<i class="icon-cog"></i><span class="on-show-sidebar">Настройки QMS Plus</span><i class="icon-down-dir-1"></i>' +
    '</a>' +
    '<ul class="dropdown-menu pull-right">' +
    optionHtml('hide-header', 'Скрывать шапку (header)', options['hide-header']) +
    optionHtml('hide-footer', 'Скрывать подвал (footer)', options['hide-footer']) +
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

// Скрытие шапки
if (options['hide-header']) {
    $('body').addClass('hide-header');
}

// Скрытие подвала
if (options['hide-footer']) {
    $('body').addClass('hide-footer');
}

/*
 * Действия после document.ready
 */

$(function () {
    var $settings = $('#qms-plus');

    $settings.find('.checkbox').change(function () {
        options[this.name] = this.checked;
        GM_setValue('options', options);
        $settings[0]._tippy.show();
    });

    tippy('#qms-plus', {
        content: 'Сохранено. Обновите страницу (F5)',
        trigger: 'manual',
        distance: 3
    });
});
