let onDark = false;
$(function(){

    /**
     * Trigger Popover
     */
    $('.popover-dismiss').popover({
        trigger: 'focus'
    });

    /**
     * When user submit form, get query from textbox in form,
     * Get data from api function with specific query, and generate html output.
     */
    $("#searchForm").submit( e => {
        e.preventDefault(); //Prevent default event of form submit

        /********Trigger the transition by add or remove class*********/
        const result = $("#result");

        if (result.hasClass("invisible")) {
            $("header.container-fluid").addClass("shrink");
            $("header h1").addClass("shrink");
            $(".footer").addClass("hide");
            setTimeout(() => {
                result.removeClass("d-none invisible hide").addClass("show");
                $(".footer").removeClass("hide").addClass("show")
            }, 500);
        }

        if ( $("#gOut").hasClass("show")) {
            leftFadeOut();
        }

        if ( $("#ytOut").hasClass("show")) {
            rightFadeOut();
        }

        /**************************************/

        /**Get data and generate output form custom search engine api**/
        const q = $("#searchQuery").val(); //Get query from textbox
        setTimeout(()=>{            //Wait for the transition to complete
            fetchCSEapi(q,genSearchBlock); //Call
        }, 500);

        $("#yOut").html(`<br><br><h3 class="text-info"><i class="fas fa-info-circle"></i>Please select search result to search for the videos.</h3>`);
        $("#tweets").html(`<br><br><h3 class="text-info"><i class="fas fa-info-circle"></i>Please select search result to search for the tweets.</h3>`);
    });


    /**
     * When user click 'dark theme' or 'light theme' change style of page
     */
    $("#GOdark").click( e => {
        e.preventDefault();

        //Create an url for post request to server
        const path = window.location.pathname.split("/")[1];
        const url = `/${path}/Api/theme.php`;

        if (onDark) {
            $.post(url, {theme: "light"}); //Post request to server to set the theme session

            /**Change css style sheet and header background**/
            $("#GOdark").html("DarkTheme");
            $("#dark").attr("rel", "stylesheet alternate");
            $("#light").attr("rel", "stylesheet");
            $("header.container-fluid").toggleClass("light-bg dark-bg");
            onDark = false;
        } else {
            $.post(url, {theme: "dark"}); //Post request to server to set the theme session

            /**Change css style sheet and header background**/
            $("#GOdark").html("LightTheme");
            $("#dark").attr("rel", "stylesheet");
            $("#light").attr("rel", "stylesheet alternate");
            $("header.container-fluid").toggleClass("light-bg dark-bg");
            onDark = true;
        }

    });


    /**
     * Some animation
     */
    $("#top").click( e => {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

});


/**
 * When user select search result,
 * tokenize title for calculate search relevance and
 * get acronym as query for search on youtube and twitter
 * @param event
 */
function buttonClick(event) {

    //Just some animation
    const ytOut = $("#ytOut");
    if (ytOut.hasClass("show")) {
        rightFadeOut();
    }
    $("html, body").animate({ scrollTop: ytOut.offset().top }, "slow");

    //Tokenize and get acronym
    const title = $(event).parent().children("h5").html().replace(/[()]|\.+$/g,"");
    const tokens = removeStopWords(tokenize(title));
    let q = acronym(tokens);
    if (q.length === 0) {
        q.push(title);
    }
    const testTokens = new Set(removeStopWords(tokenize(title.replace(".","").toLowerCase())));

    //Wait for transition to complete and start searching
    setTimeout(()=>{

        //Search with array of acronym. After function return promise's status as resolve, generate the output
        youtubeSearchWithAcronym(q,testTokens).then(value => {
            if (value.length !== 0) {
                genYoutubeBlock(value, true);
            } else {
                genYoutubeBlock(null, false);
            }
        });

        //Search with array of acronym. After function return promise's status as resolve, generate the output
        twitterSearchWithAcronym(q, testTokens).then(value => {
            if (value.length !== 0) {
                genTwitterBlock(value, true);
            } else {
                genTwitterBlock(null, false);
            }
        })

    },500);
}

/*******************Animation function**/
function leftFadeIn() {
    $("#gOut").removeClass("hide").addClass("show");
}

function leftFadeOut() {
    $("#gOut").removeClass("show").addClass("hide");

}

function rightFadeIn() {
    $("#ytOut").removeClass("hide").addClass("show");
}

function rightFadeOut() {
    $("#ytOut").removeClass("show").addClass("hide");
}

/*******************************/

/**
 * Generate html output with data
 * @param items
 * @param success
 */
function genSearchBlock(items,success) {
    if (success) {
        $("#gOut").html("");
        items.forEach(element => {
            let title;
            if (element.pagemap !== undefined && element.pagemap.metatags[0] !== undefined) {
                title = element.pagemap.metatags[0].title || element.pagemap.metatags[0]['og:title'];
            } else {
                title = element.title;
            }
            const snippet = element.snippet;
            const link = element.link;

            const temp = document.getElementById("googleBlock");
            const btn = temp.content.querySelector("div.card");
            const block = document.importNode(btn, true);
            block.querySelector("h5.card-title").innerHTML = title;
            block.querySelector("p.card-text").innerHTML = snippet;
            $(block.querySelector(`a[href="#"]`)).attr("href",link);

            $("#gOut").append(block);
        });
    } else {
        const temp = document.getElementById("googleBlock");
        const btn = temp.content.querySelector("div.card");
        const block = document.importNode(btn, true);

        block.querySelector(".card-body").innerHTML = `<h3 class="card-title text-danger">
                <i class="fas fa-exclamation-circle"></i> <b>
                No result found. Please try with another keyword...</b></h3>`;

        $("#gOut").html(block);
    }
    leftFadeIn();
    rightFadeIn();
}

/**
 * Generate html output with data
 * @param items
 * @param success
 */

function genYoutubeBlock(items,success) {
    if (success) {
        $("#yOut").html("");
        //Split to each card-deck
        let decks = [];
        while (items.length > 0) {
            decks.push(items.splice(0,4));
        }

        decks.forEach(deck => {
            const templateRow = document.getElementById("row-center");
            const templateCard = document.getElementById("youtubeCard");
            const card_deck = templateRow.content.querySelector("div.row");
            const card_for_clone = templateCard.content.querySelector("div.card-container");
            const new_deck = document.importNode(card_deck,true);

            deck.forEach(card => {
                const title = card.title;
                const imgUrl = card.imgUrl;
                const id = card.id;
                const score = card.relevant;

                const new_card = document.importNode(card_for_clone,true);
                $(new_card.querySelector(".card-img-top")).attr("src",imgUrl);
                new_card.querySelector(".card-title").innerHTML = title;
                $(new_card.querySelector(`a[href="#"]`)).attr("href", `https://www.youtube.com/watch?v=${id}`);
                new_card.querySelector("span").innerHTML = `Relevant Score: ${score}`;

                $(new_deck).append(new_card);
            });
            $("#yOut").append(new_deck);
        });

    } else {
        $("#yOut").html(`<br><br><h5 class="text-danger"><i class="fas fa-info-circle"></i>No result found...</h5>`);
    }
    rightFadeIn();
}

/**
 * Generate html output with data
 * @param items
 * @param success
 */
function genTwitterBlock(items,success) {
    if (success) {
        $("#tweets").html("");
        //Split to each card-deck
        let decks = [];
        while (items.length > 0) {
            decks.push(items.splice(0, 4));
        }

        decks.forEach(deck => {
            const templateRow = document.getElementById("row-center");
            const templateCard = document.getElementById("twitterCard");
            const card_deck = templateRow.content.querySelector("div.row");
            const card_for_clone = templateCard.content.querySelector("div.card-container");
            const new_deck = document.importNode(card_deck, true);

            deck.forEach(card => {
                const name = card.name;
                const sname = card.sname;
                const img = card.profileUrl;
                const text = card.text;
                const tweetUrl = card.tweetUrl;
                const sentiment = card.sentiment;

                const new_card = document.importNode(card_for_clone, true);

                $(new_card.querySelector("img")).attr("src", img);
                new_card.querySelector("b").innerHTML = name;
                new_card.querySelector("div.card-body span").innerHTML += sname;
                new_card.querySelector("p").innerHTML = text;
                if (tweetUrl === null) {
                    $(new_card.querySelector(`a[href="#"]`)).addClass(".not-active");
                    $(new_card.querySelector(`span.d-inline-block`)).attr("title", "Sorry, we can't get Tweet's url for you :(");
                }
                $(new_card.querySelector(`a[href="#"]`)).attr("href", tweetUrl);
                new_card.querySelector("span.float-right").innerHTML += sentiment;
                $(new_deck).append(new_card);
            });
            $("#tweets").append(new_deck);
        });
        $('[data-toggle="tooltip"]').tooltip();

        if (twitterSentiments !== null) {
            let ctx = $("#chart");
            barChart(ctx, twitterSentiments);
        }
    } else {
        $("#tweets").html(`<br><br><h5 class="text-danger"><i class="fas fa-info-circle"></i>No result found...</h5>`);
    }
}

/**
 * Generate bar chart for overall sentiments
 * @param ctx
 * @param data
 */
function barChart(ctx,data) {
    const { positive, neutral, negative } = data;
    let barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Positive", "Neutral", "Negative"],
            datasets: [{
                borderWidth: 3,
                backgroundColor: ["rgba(111, 216, 94, 0.5)", "rgba(129, 173, 206, 0.5)", "rgba(255, 154, 154, 0.5)"],
                borderColor: ["rgba(57, 188, 23, 0.5)", "rgba(26, 93, 144, 0.5)", "rgba(224, 28, 28, 0.5)"],
                data: [positive,neutral,negative]
            }]
        },
        options: {
            title: {
                display: true,
                text: "Overall Sentiment"
            },
            scales: {
                labelString: "Frequency",
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    });
}
