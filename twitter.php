<?php
	header('Content-type: application/json; charset=utf-8');
	header('Access-Control-Allow-Origin: *');
	require 'lib/autoload.php';
	include "vendor/autoload.php";
	use Sentiment\Analyzer;
	use Abraham\TwitterOAuth\TwitterOAuth;
	error_reporting(E_ERROR | E_PARSE);

	/**Function to search and get result from twitter with TwitterOAuth
	 * @param array $query
	 * @return array|object
	 */
	function search(array $query)
	{
		$toa = new TwitterOAuth('xxx','xxx','xxx','xxx');
		return $toa->get('search/tweets', $query);
	}

	if($_GET["action"]) {
		//Set parameters for search
		$query = array(
			"q" => $_GET["q"],
			"count" => $_GET["max"],
			"lang" => "en"
		);

		//Get result from function and initialize variable
		$analyzer = new Analyzer();
		$results = search($query);
		$data = array();
		$obj = array();
		$obj["sentiments"]["positive"] = 0;
		$obj["sentiments"]["negative"] = 0;
		$obj["sentiments"]["neutral"] = 0;
		$i = 0;

		//Collect specific data from search's result
		foreach ($results->statuses as $result) {
                $data[$i]["text"] = $result->text;

                $sentiments = $analyzer->getSentiment($result->text);
                if ($sentiments["compound"] > 0) {
                    $data[$i]["sentiment"] = "Positive";
                    $obj["sentiments"]["positive"]++;
				} else if ($sentiments["compound"] < 0) {
                    $data[$i]["sentiment"] = "Negative";
                    $obj["sentiments"]["negative"]++;
				} else {
                    $data[$i]["sentiment"] = "Neutral";
                    $obj["sentiments"]["neutral"]++;
				}

                if (!empty($result->entities->urls) && isset($result->entities->urls[0]->expanded_url)) {
                    $data[$i]["tweetUrl"] = $result->entities->urls[0]->expanded_url;
                }
                $data[$i]["name"] = $result->user->name;
                $data[$i]["sname"] = $result->user->screen_name;
                $data[$i]["profile_url"] = $result->user->profile_image_url;
                $i++;
		}

		$obj["data"] = $data;

		//Send JSON back
        echo json_encode($obj);
	}
?>
