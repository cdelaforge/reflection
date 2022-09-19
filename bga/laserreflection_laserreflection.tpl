{OVERALL_GAME_HEADER}

<!--
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- LaserReflection implementation : © Christophe Delaforge <christophe@delaforge.eu>
--
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    laserreflection_laserreflection.tpl

    This is the HTML template of your game.

    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.

    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format

    See your "view" PHP file to check how to set variables and control blocks

    Please REMOVE this comment before publishing your game on BGA
-->

<div id="lrf_timer" style="display:none"></div>

<div id="lrf_main">
    <div id="root" style="visibility:hidden"></div>
    <div id="lrf_end" class="whiteblock" style="display:none">
        <div>{PUZZLES}</div>
        <div>
            <select onchange="gameUI.displayPuzzle(this.value)" id="playerSelect">
                <!-- BEGIN player_puzzle -->
                <option value="{PLAYER_ID}" {PLAYER_SELECTED}>{PLAYER_NAME}</option>
                <!-- END player_puzzle -->
            </select>
        </div>
    </div>
    <div id="lrf_end_rnd" class="whiteblock" style="display:none">
        <div>{ROUND_PUZZLES}</div>
        <div>
            <select onchange="gameUI.displayRoundPuzzle(this.value)" id="roundSelect"></select>
        </div>
    </div>
</div>

<div id="lrf_teams" class="whiteblock" style="display:none">
    <div class="lrf_team_title">{TEAM_SELECTION}</div>
    <div id="lrf_team_1" class="lrf_team" onclick="gameUI.selectTeam(1)">{TEAM_1} 🧙</div>
    <div id="lrf_team_2" class="lrf_team" onclick="gameUI.selectTeam(2)">{TEAM_2} 🧛</div>
    <div id="lrf_team_3" class="lrf_team" onclick="gameUI.selectTeam(3)">{TEAM_3} 👽</div>
</div>

<div id="lrf_spectator" class="whiteblock" style="display:none">
    <div>{SPECTATOR_TEXT}</div>
</div>

<script type="text/javascript">

// Javascript HTML templates

var jstpl_giveup = '\
    <div id="giveup-decision" class="whiteblock" style="display: none;">\
        <span id="giveup-decision-title">${giveup_decision_title}</span><br>\
        <a href="#" id="giveup_decision_yes" class="bgabutton bgabutton_blue" data-ol-has-click-handler="">${yes}</a>\
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
        <a href="#" id="giveup_decision_no" class="bgabutton bgabutton_blue" data-ol-has-click-handler="">${no}</a>\
        <div id="giveup-decision-players-div">\
            <p>${yes}: <span id="giveup-decision-players"></span></p>\
        </div>\
    </div>';

var jstpl_progressbar = '\
    <div id="${iid}" class="lrf_info">\
        <div id="${pid}" class="lrf_progress-bar__main">\
            <div id="${sid}" class="lrf_progress-bar__container" style="box-shadow: 0 0 5px #${color};width:${bar_width}">\
                <div class="lrf_progress-bar" style="left:-${dec}%;background-color:#${color};">\
                    <span class="lrf_progress-bar__text" style="padding-left:${dec}%; display:${text_disp}">${progression}%</span>\
                </div>\
            </div>\
            <div id="${cid}" class="lrf_counter">${counter}</div>\
        </div>\
        <div id="${rid}" class="lrf_resting" style="display:none">\
            <label>😎</label>\
            <span>${my_puzzle}</span>\
        </div>\
        <div id="${fid}" class="lrf_resting" style="display:none">\
            <label>😕</label>\
            <span>${failed}</span>\
        </div>\
        <div id="${aid}" class="lrf_resting" style="display:none">\
            <label>😴</label>\
            <span>${sleeping}</span>\
        </div>\
        <div id="${tid}" class="lrf_resting" style="display:none">\
            <label>🤨</label>\
            <span>${selecting}</span>\
        </div>\
        <div id="${oid}" class="lrf_resting" style="display:none">\
            <label>👍</label>\
            <span>${selected}</span>\
        </div>\
    </div>';
</script>

{OVERALL_GAME_FOOTER}
