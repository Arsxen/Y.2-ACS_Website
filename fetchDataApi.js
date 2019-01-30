let twitterSentiments = null;

/**
 * Youtube class for convenience
 */
class youtubeObj {
    constructor(title, imgUrl, id) {
        this.title = title;
        this.imgUrl = imgUrl;
        this.id = id;
        this.relevant = 0;
    }

    /**
     * Calculate relevance with set of token word
     * @param tokensSet
     */
    calculateRelevance(tokensSet) {
        const titleTokens = removeStopWords(tokenize(this.title.toLowerCase()));

        titleTokens.forEach(element => {
           if (tokensSet.has(element.toLowerCase())) {
               this.relevant++;
           }
        });
    }
}

/**
 * Twitter class for convenience
 */
class twitterObj {
    constructor(name, sname, profileUrl, text, tweetUrl, sentiment) {
        this.name = name;
        this.sname = name;
        this.profileUrl = profileUrl;
        this.text = text;
        this.tweetUrl = tweetUrl;
        this.sentiment = sentiment;
        this.relevant = 0;
    }

    /**
     * Calculate relevance with set of token word
     * @param tokensSet
     */
    calculateRelevance(tokensSet) {
        const textTokens = removeStopWords(tokenize(this.text.toLowerCase()));

        textTokens.forEach(element => {
           if (tokensSet.has(element.toLowerCase())) {
               this.relevant++;
           }
        });
    }
}

/**
 * Fetch data from custom search api with specific query
 * @param query
 * @param callback
 */
function fetchCSEapi(query, callback) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=011074666240725702997%3A3qj4uwcwkgw&key=AIzaSyAtlL-fLCQ1uwTW3tMlPtgpDfSDmxW3xug`;
    $.getJSON(url, data => {
        if (data.searchInformation.totalResults > 0) {
            const items = data.items.slice(0,20);
            callback(items,true);
        } else {
            callback(null,false);
        }
    });
}

/**
 * Fetch data from youtube api with specific query
 * @param query
 * @param callback
 */
function fetchYoutubeApi(query,max) {
    console.log(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${max}&q=${query}&type=video&key=AIzaSyAtlL-fLCQ1uwTW3tMlPtgpDfSDmxW3xug`;
    return $.getJSON(url).then( data => {
        let result = [];
        if (data.pageInfo.totalResults > 0) {
            const items = data.items;
            items.forEach(element=>{
                const title = element.snippet.title;
                const img = element.snippet.thumbnails.medium.url;
                const id = element.id.videoId;

                const youtube = new youtubeObj(title, img, id);
                result.push(youtube);
            });
        }
        return result;
    });
}

/**
 * Fetch data from twitter api with specific query
 * @param query
 * @param callback
 */
function fetchTwitterApi(query, max) {
    console.log(query);
    const path = window.location.pathname.split("/")[1];
    const url = `/${path}/Api/twitter.php?q=${query}&max=${max}&action=get`;
    return $.getJSON(url).then( data => {
        let result = [];
        twitterSentiments = null;
        if (data.data.length > 0) {
            twitterSentiments = {
                positive: data.sentiments.positive,
                neutral: data.sentiments.neutral,
                negative: data.sentiments.negative
            };
            const items = data.data;
            items.forEach(element => {
                const name = element.name;
                const sname = element.sname;
                const profile = element.profile_url;
                const text = element.text;
                const sentiment = element.sentiment;

                let tweetUrl = null;
                if (element.tweetUrl !== undefined) {
                    tweetUrl = element.tweetUrl;
                }

                const tweet = new twitterObj(name, sname, profile, text, tweetUrl, sentiment);
                result.push(tweet);
            });
        }
        return result;
    });
}

/**
 * Search youtube with array of acronym and calculate relevance of each result
 * @param arco_array
 * @param tokensTest
 * @returns {Promise<[any, any, any, any, any, any, any, any, any, any] | never>}
 */
function youtubeSearchWithAcronym(arco_array, tokensTest) {
    const max_per_acro = Math.floor(20/arco_array.length);
    let promise = [];
    for (let i = 0; i < arco_array.length; i++) {
        promise.push(fetchYoutubeApi(arco_array[i],max_per_acro));
    }

    return Promise.all(promise)
        .then( returnData => {
            let youtubeResult  = returnData.reduce((acc,cur)=> acc.concat(cur),[]);

            for (let i = 0; i < youtubeResult.length; i++) {
                youtubeResult[i].calculateRelevance(tokensTest);
            }

            youtubeResult.sort((a,b) => b.relevant - a.relevant);

            return youtubeResult;
        });
}

/**
 * Search twitter with array of acronym and calculate relevance of each result
 * @param arco_array
 * @param tokensTest
 * @returns {Promise<[any, any, any, any, any, any, any, any, any, any] | never>}
 */
function twitterSearchWithAcronym(arco_array, tokensTest) {
    const acro_nonum = arco_array.map(x => x.replace(/[0-9]+/g,""));
    const max_per_acro = Math.floor(20/arco_array.length);
    let promise = [];
    for (let i = 0; i < arco_array.length; i++) {
        promise.push(fetchTwitterApi(acro_nonum[i],max_per_acro));
    }

    return Promise.all(promise)
        .then( returnData =>{
            let twitterResult = returnData.reduce((acc,cur) => acc.concat(cur), []);

            for (let i = 0; i < twitterResult.length; i++) {
                twitterResult[i].calculateRelevance(tokensTest);
            }

            twitterResult.sort((a,b) => b.relevant - a.relevant);

            return twitterResult;
        });

}