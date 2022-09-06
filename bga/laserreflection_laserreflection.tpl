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
            <select onchange="utils.displayPuzzle(this.value)" id="playerSelect">
                <!-- BEGIN player_puzzle -->
                <option value="{PLAYER_ID}" {PLAYER_SELECTED}>{PLAYER_NAME}</option>
                <!-- END player_puzzle -->
            </select>
        </div>
    </div>
    <div id="lrf_end_rnd" class="whiteblock" style="display:none">
        <div>{ROUND_PUZZLES}</div>
        <div>
            <select onchange="utils.displayRoundPuzzle(this.value)" id="roundSelect"></select>
        </div>
    </div>

</div>

<script type="text/javascript">

// Javascript HTML templates

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
            <span>${my_puzzle}</span>\
            <svg xmlns="http://www.w3.org/2000/svg" height=32 viewBox="0 0 1000 1000">\
                <g>\
                    <path d="M989.2,494.8c-7.8-48.2-24.7-96.8-49.9-138.7c-9.8,34.5-36.5,61.9-70.6,72.6c5,10.8,9.4,21.8,13.2,33.1c-16.8,0.4-33.7,0.3-50.5-0.3c-26.6-36.8-82.4-56.8-127.8-21.5c-11.3-24.4-19.8-49.5-24.4-75.7c20.2,1.2,40.4,2.8,60.4,5.5c-5.8-13.1-9.1-27.6-9.1-42.8c0-19.4,5.3-37.6,14.4-53.3c-39.1-4.6-78.6-6-117.8-9.2c-26.9-2.2-47.5,23.6-48.2,48.2c-2.3,68,17.4,131.4,48.2,190.7c-30.9,24.8-59.6,47.1-91.2,72.8c-40.2-40.2-86.8-74.9-133.3-106.3c-24.2-16.4-52.5-6.7-73.1,9.5c-63.1,49.5-126.1,99-189.2,148.5c-9.6,7.5-15.5,15.9-18.5,24.5c-17.8,0-35.6,0-53.4,0c-77.8,0-77.8,120.6,0,120.6c152.8,0,305.5,0,458.3,0c36.5,0,58.5-18.4,70.7-28.8c84.1-72.8,138-109.4,222.1-182.2c2-1.7,3.7-3.4,5.4-5.1c39.3,1.8,78.9,0.8,117.9-1C976.4,554.3,994.2,526.4,989.2,494.8z M302.8,652.3c23.7-18.6,47.5-37.2,71.2-55.8c23.9,17,47.7,35.4,69,55.8C396.3,652.3,349.6,652.3,302.8,652.3z"/><path d="M839.5,414.7c51.8,0,93.8-42.1,93.8-93.9c0-51.7-42.1-93.8-93.8-93.8c-51.7,0-93.8,42.1-93.8,93.8C745.7,372.6,787.8,414.7,839.5,414.7z"/>\
                </g>\
            </svg>\
        </div>\
    </div>'
</script>

{OVERALL_GAME_FOOTER}
