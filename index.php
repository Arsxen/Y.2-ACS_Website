<?php
    session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>A-CON : Academic Conference Searcher</title>
    <!-- Bootstrap css-->
    <link id="light" rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link id="dark" href="https://stackpath.bootstrapcdn.com/bootswatch/4.1.3/darkly/bootstrap.min.css" rel="stylesheet alternate" integrity="sha384-w+yWASP3zYNxxvwoQBD5fUSc1tctKq4KUiZzxgkBSJACiUp+IbweVKvsEhMI+gz7" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <header class="container-fluid light-bg">
    <div class="row h-100">
        <form id = "searchForm" class="mx-auto my-auto">
            <h1 class="display-1 font-weight-bold">A-CON</h1><br>
            <div class="input-group input-group-lg">
                <input type="text" name="query" class="form-control" id="searchQuery" placeholder="Search Query" aria-label="Search Query" aria-describedby="Search Query">
                <div class="input-group-append">
                    <input class="btn btn-success" type="submit" name="submit" id="searchSubmit" value="search">
                </div>
            </div>
        </form>
    </div>
    </header>
    <!-- Google Card template -->
    <template id="googleBlock">
        <div class="google-block card my-5 mx-2">
            <div class="card-body">
                <h5 class="card-title"></h5>
                <hr>
                <p class="card-text"></p>
                <a href="#" target="_blank">Go to the website</a>
                <button class="float-right btn btn-primary" onclick="buttonClick(this)">Video and Tweets</button>
            </div>
        </div>
    </template>

    <!-- Youtube Card template -->
    <template id="youtubeCard">
        <div class="card-container my-2 col-lg-3 col-md-6">
            <div class="card c-1 h-100">
                <img class="card-img-top" src="#" alt="youtube thumbnail">
                <div class="card-body">
                    <h5 class="card-title"></h5>
                </div>
                <div class="card-footer">
                    <a href="#" target="_blank">Play on youtube</a>
                    <span class="float-right text-muted"></span>
                </div>
            </div>
        </div>
    </template>

    <!-- Twitter Card template -->
    <template id="twitterCard">
        <div class="card-container my-2 col-lg-3 col-md-6">
            <div class="card c-1 h-100">
                <div class="card-body">
                    <img src="#" class="float-left rounded-circle" alt="Twitter Profile Image">
                    &ensp;<b></b><br>
                    &ensp;<span class="text-muted">@</span><hr><br>
                    <p></p>
                </div>
                <div class="card-footer">
                    <span class="d-inline-block" tabindex="0" data-toggle="tooltip" title="Open tweet on twitter">
                        <a href="#" target="_blank">Visit</a>
                    </span>
                    <span class="float-right text-muted">Sentiment: </span>
                </div>
            </div>
        </div>
    </template>

    <!-- Row template for convenience -->
    <template id="row-center">
        <div class="row justify-content-center"></div>
    </template>


    <!-- Search result container -->
    <div class="container-fluid d-none invisible content hide" id="result">
    <div class="row justify-content-center">
        <div class="col-xl-3 show" id="gOut"></div>
        <div class="col-xl-8 p-3 hide" id="ytOut">
            <ul class="nav nav-tabs" id="tab" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="youtube-tab" data-toggle="tab" href="#yOut" role="tab" aria-controls="youtube" aria-selected="true">Youtube</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="twitter-tab" data-toggle="tab" href="#tOut" role="tab" aria-controls="twitter" aria-selected="false">Twitter</a>
                </li>
            </ul>
            <div class="tab-content" id="tabContent">
                <div class="tab-pane fade show active" id="yOut" role="tabpanel" aria-labelledby="youtube-tab"></div>
                <div class="tab-pane fade" id="tOut" role="tabpanel" aria-labelledby="twitter-tab">
                    <div id="tweets"></div>
                    <div class="row justify-content-center">
                        <div class="chart-container my-3 col-lg-6 mh-100">
                            <canvas id="chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

    <!-- Page footer -->
    <footer class="footer container-fluid bg-dark text-white">
        <div class="row justify-content-center">
            Background by SVGBackgrounds.com
            <button class="btn btn-outline-primary mx-2 mt-2" style="height: 80%;" type="button" id="GOdark">DarkTheme</button>
            <button class="btn btn-outline-primary mx-2 mt-2" style="height: 80%;" type="button" id="about" data-toggle="modal" data-target="#our-info">About us</button>
            <button class="btn btn-outline-primary mx-2 mt-2" style="height: 80%;" type="button" id="top" >Back to Top</button>
        </div>
    </footer>

    <!-- About us Modal-->
    <div class="modal fade" id="our-info" tabindex="-1" role="dialog" aria-labelledby="about us" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered  modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">About us (Click on image to reveal information)</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <a class="abUS col-4 popover-dismiss" role="button" tabindex="0" data-toggle="popover" data-trigger="focus" data-html="true" data-content="Archawat Silachote <br> Sec.3 ID:6088168"><img src="Profile/Ton.jpg" class="rounded-circle img-fluid" alt="Archawat Silachote"></a>
                        <a class="abUS col-4 popover-dismiss" role="button" tabindex="0" data-toggle="popover" data-trigger="focus" data-html="true" data-content="Wutthipat Muesantad <br> Sec.3 ID:6088094"><img src="Profile/Oam.jpg" class="rounded-circle img-fluid" alt="Wutthipat Muesantad"></a>
                        <a class="abUS col-4 popover-dismiss" role="button" tabindex="0" data-toggle="popover" data-trigger="focus" data-html="true" data-content="Kullapat Ongkanchana <br> Sec.3 ID:6088106"><img src="Profile/L.jpg"   class="rounded-circle img-fluid" alt="Kullapat Ongkanchana"></a>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Bootstrap ,Jquery, and Javascript -->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    <script src="acronym_tokenizer.js"></script>
    <script src="fetchDataApi.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.min.js"></script>
    <script src="Index-UI-Controller.js"></script>
    <script>

        //if session is set, change website theme according to session
        <?php
                if (isset($_SESSION["theme"])) {
                    if ($_SESSION["theme"] === "dark") {
                        echo "const dark = true;";
                    }
                }
        ?>
        $(function () {
            if (dark === true) {
                $("#GOdark").trigger("click");
            }
        });
    </script>
</body>
</html>