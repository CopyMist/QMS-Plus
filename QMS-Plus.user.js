// ==UserScript==
// @name         QMS Plus
// @namespace    4PDA
// @version      0.5
// @description  Юзерскрипт для добавления/исправления функционала QMS на форуме 4PDA
// @author       CopyMist
// @license      https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ru
// @icon         https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/icon-128.png
// @homepage     https://4pda.ru/forum/index.php?showforum=5
// @updateURL    https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/QMS-Plus.user.js
// @match        https://4pda.ru/forum/*act=qms*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.1/umd/popper.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tippy.js/5.2.1/tippy-bundle.iife.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.min.js
// @resource     backgroundSvg https://raw.githubusercontent.com/CopyMist/QMS-Plus/master/background.svg
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

/* global $, _, tippy */

/*
 * Стили
 */

var cssCode = [
    '.body-tbl svg { height: 100%; padding: 1%; }',
    '.header, #contacts, #body, .footer, .navbar, .navbar .nav-left, .navbar .nav, .navbar .nav-right { transition: none; }',
    // Dropdown checkboxes
    '.dropdown .chk-wrap { display: flex; align-items: center; }',
    '.dropdown .chk-left { width: 13px; height: 13px; margin: 1px 0 0 20px; }',
    '.dropdown .chk-right { display: block; padding: 3px 20px 3px 7px; white-space: nowrap; }',
    '.dropdown-menu > li > a:hover, .dropdown .chk-wrap:hover { background-color: #E4EAF2; }',
    '.dropdown .chk-wrap > input:hover, .dropdown .chk-wrap > label:hover { cursor: pointer; }',
    // Tippy
    '.tippy-tooltip { background-color: #eaf4ff; color: #4373c3; font-weight: bold; }',
    '.tippy-tooltip[data-placement^=top]>.tippy-arrow { border-top-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=bottom]>.tippy-arrow { border-bottom-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=left]>.tippy-arrow { border-left-color: #eaf4ff; }',
    '.tippy-tooltip[data-placement^=right]>.tippy-arrow { border-right-color: #eaf4ff; }',
    // Hide header/footer
    'body.hide-header .holder-no-hidden, body.hide-header .menu-main-mobile { display: none; }',
    'body.hide-header .navbar { top: 0; }',
    'body.hide-header .header { height: 42px; max-height: 42px; }',
    'body.hide-header #contacts, body.hide-header #body { top: 42px; }',
    'body.hide-footer .footer { display: none; }',
    'body.hide-footer #contacts, body.hide-footer #body { bottom: 0; }',
    // Custom scroll
    'body.custom-scroll .scrollframe::-webkit-scrollbar { width: 13px; }',
    'body.custom-scroll #scroll-contacts::-webkit-scrollbar { width: 7px; }',
    'body.custom-scroll .scrollframe::-webkit-scrollbar-track { background-color: #fff; border: 0; }',
    'body.custom-scroll .scrollframe::-webkit-scrollbar-thumb { background: linear-gradient(to left, #E0EEFF, #C6E0FF); border: 1px solid #C6E0FF; border-right: 0; }',
    'body.custom-scroll .scrollframe::-webkit-scrollbar-thumb:hover { background: #e0eeff; }',
    'body.custom-scroll .scrollframe::-webkit-scrollbar-thumb:active { background-color: #C6E0FF; }',
    'body.custom-scroll .scrollframe > .scrollframe-body { transform: none !important; padding-bottom: 0; }',
    'body.custom-scroll .logo-in-qms .list-group .list-group-item { margin-left: 7px; padding-left: 5px; }'
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

function initSettings() {
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
}

function removeNiceScroll($selector) {
    var $scrolls = $selector.getNiceScroll();

    if ($scrolls.length) {
        $scrolls.remove();

        $scrolls.each(function() {
            // Крутим вниз, если диалог
            var element = this.opt.win[0];
            if (element.id === 'scroll-thread') {
                setTimeout(function() {
                    element.scrollTop = element.scrollHeight;
                }, 100);
            }
        });
    }
}

/*
 * Глобальные переменные
 */

var options = GM_getValue('options');
if (!options) {
    options = {
        'hide-header': true,
        'hide-footer': true,
        'smooth-disable': true
    };
    GM_setValue('options', options);
}

var qmsClass = '.logo-in-qms';
var bgSvg = GM_getResourceText('backgroundSvg');
var settingsHtml = '' +
    '<div class="dropdown" id="qms-plus">' +
    '<a href="#" class="btn" title="Настройки QMS Plus" data-toggle="dropdown">' +
    '<i class="icon-cog"></i><span class="on-show-sidebar">Настройки QMS Plus</span><i class="icon-down-dir-1"></i>' +
    '</a>' +
    '<ul class="dropdown-menu pull-right">' +
    optionHtml('hide-header', 'Скрывать шапку (header)', options['hide-header']) +
    optionHtml('hide-footer', 'Скрывать подвал (footer)', options['hide-footer']) +
    optionHtml('smooth-disable', 'Убрать плавную прокрутку', options['smooth-disable']) +
    '</ul>' +
    '</div> &nbsp;';

/*
 * До document.ready
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
        initSettings();
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
 * После document.ready
 */

$(function () {
    initSettings();

    // Доступ к родному jQuery форума
    var $u = unsafeWindow.$;

    if (options['smooth-disable']) {
        $('body').addClass('custom-scroll');

        // Убираем jQuery.NiceScroll
        removeNiceScroll($u('[data-scrollframe-init]'));
        $(qmsClass).arrive('.nicescroll-rails', function () {
            removeNiceScroll($u(this).parent());
        });

        // Крутим при новых сообщениях
        $(qmsClass).arrive('[data-message-id]', _.debounce(function () {
            this.scrollIntoView({behavior: 'smooth', block: 'end'});
        }, 100));
    }
});
