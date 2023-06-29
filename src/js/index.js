init()
function init() {
    detectMobile()
    changeGenreNumberToText()
    changeLanguage()
    checkPages()
    addPageControlEvents()
    chargeProviders()
    downloadButton()
    if (document.getElementById("darkMode").checked == false) {
        $("#darkModeButton").click()
    }
}

function loadTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

function downloadButton() {
    window.detectAndroid = function () {
        let check = false;
        (function (a) { if (/(Version\/\d+.*\/\d+.0.0.0 Mobile|; ?wv|(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari))/i.test(navigator.userAgent)) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };
    if (detectAndroid() == false && mobileCheck() == true) {
        $("#divDownloadButton").append(`<a href = "/apk/moviehunter.apk" download = "Movie Hunter"> <button class="btn btn-primary"><i class="fa fa-download"></i>        Download APK</button></a>`)
    }
}

function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

$("#people").change(function () {
    $(this).blur()
    var value = $(this).val();
    $("[name='peopleID']").val($('#peopleList [value="' + value + '"]').data('value'))
})

$('#people').keyup(delay(function (e) {
    $.post('/people', { query: $(this).val(), language: $("#language").val() }, function (response) {
        $("#peopleList")[0].innerHTML = response
    })
}, 500));

function chargeProviders() {
    var providers = $("#watchprovidersvalue").val()
    if (providers) {
        providers = providers.split("|")
        $("#watchproviders").val(providers)
    }
}

function changeModal(e) {
    var titleMedia = $(e).parent().parent().find("h5")[0].innerText
    var idMedia = $(e).parent().parent().parent().parent()[0].id.split("collapse")[1]
    $("#mediaID")[0].value = idMedia
    var type = $("#type")[0].value
    $("#typeMedia")[0].value = type
    switch ($("#language")[0].value) {
        case 'es':
            $("#exampleModalLabel")[0].innerText = `Notificación para \"${titleMedia}\"`
            $("#email")[0].placeholder = 'Inserte su email'
            break;
        case 'en':
            $("#exampleModalLabel")[0].innerText = `Notification for \"${titleMedia}\"`
            $("#email")[0].placeholder = 'Insert your email'
            break;
        case 'de':
            $("#exampleModalLabel")[0].innerText = `Benachrichtigung für \"${titleMedia}\"`
            $("#email")[0].placeholder = 'Geben Sie Ihre E-Mail ein'
            break;
    }

}

function closeModal() {
    if ($("[data-bs-dismiss='alert']")[0]) {
        $("[data-bs-dismiss='alert']")[0].click()
    }
    $("#email")[0].value = ''
}

function sendNotification() {
    var email = $("#email")[0].value.trim()
    var id = $("#mediaID")[0].value
    var type = $("#typeMedia")[0].value
    var language = $("#language")[0].value
    $.post("/notification", { email: email, id: id, type: type, language: language }, function (result) {
        $("#alerts")[0].innerHTML = result
    });
}

function addPageControlEvents() {
    $("form .form-control").on('change', function () {
        $("#pageNumber")[0].value = 1
    })
    $("form .form-select").on('change', function () {
        $("#pageNumber")[0].value = 1
    })
}

function resetPage() {
    $("#pageNumber")[0].value = 1
    $("form")[0].submit()
}

/**
 * 
 * @param {Number} e 
 */
function changePage(e) {
    var actualPage = Number($("#pageNumber")[0].value)
    $("#pageNumber")[0].value = e == 0 ? --actualPage : ++actualPage
    $("form")[0].submit()
}

function checkPages() {
    var pageNumber = Number($("#pageNumber")[0].value)
    var totalPages = Number($("#totalPages")[0].value)
    if (pageNumber == 1) {
        $("#pageBefore").attr("disabled", "disabled")
        $("#pageBefore").removeClass("btn-primary")
        $("#pageBefore").addClass("btn-secondary")
    }
    if (pageNumber >= totalPages) {
        $("#pageAfter").attr("disabled", "disabled")
        $("#pageAfter").removeClass("btn-primary")
        $("#pageAfter").addClass("btn-secondary")
    }
}

function changeType(e) {
    $("#pageNumber")[0].value = 1
    var valor = e.value
    $("form")[0].reset()
    $("#genre")[0].value = ''
    $("#type")[0].value = valor
    $("form")[0].submit()
}

function detectMobile() {
    window.mobileCheck = function () {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };
    if (mobileCheck() == false) {
        $("#languages option")[0].text = "Español"
        $("#languages option")[1].text = "English"
        $("#languages option")[2].text = "Deustch"
    }
}

function changeColors(e) {
    if (e.value == '🌙') {
        document.getElementById("darkMode").checked = true
        $("#formBusqueda").addClass("dark");
        $("#formBusqueda").removeClass("light");
        $("#resultadosDiv").addClass("dark");
        $("#resultadosDiv").removeClass("light");
        $("#honorifics").addClass("dark");
        $("#honorifics").removeClass("light");
        $(".accordion").addClass("dark");
        $(".accordion").removeClass("light");
        $(".accordion-item").addClass("dark");
        $(".accordion-item").removeClass("light");
        $.each($(".accordion-button"), function (i, item) {
            $(item).addClass("dark")
            $(item).removeClass("light")
        })
        $.each($(".accordion-body"), function (i, item) {
            $(item).addClass("dark")
            $(item).removeClass("light")
        })
        e.value = '☀'
        $("body").addClass("dark")
        $("body").removeClass("light")
        $(e).removeClass("btn-dark")
        $(e).addClass("btn-warning")
    } else if (e.value == '☀') {
        document.getElementById("darkMode").checked = false
        $("#formBusqueda").addClass("light");
        $("#formBusqueda").removeClass("dark");
        $("#resultadosDiv").addClass("light");
        $("#resultadosDiv").removeClass("dark");
        $("#honorifics").removeClass("dark");
        $("#honorifics").addClass("light");
        $(".accordion").addClass("light");
        $(".accordion").removeClass("dark");
        $(".accordion-item").addClass("light");
        $(".accordion-item").removeClass("dark");
        $.each($(".accordion-button"), function (i, item) {
            $(item).addClass("light")
            $(item).removeClass("dark")
        })
        $.each($(".accordion-body"), function (i, item) {
            $(item).addClass("light")
            $(item).removeClass("dark")
        })
        e.value = '🌙'
        $("body").addClass("light")
        $("body").removeClass("dark")
        $(e).removeClass("btn-warning")
        $(e).addClass("btn-dark")
    }
    e.blur();
}

function changeGenreNumberToText() {
    var idsMovies = $(".genres_ids")
    var separator = 0
    switch ($("#language")[0].value) {
        case 'es':
            separator = 0
            break;
        case 'en':
            separator = 1
            break;
        case 'de':
            separator = 2
            break;
        default:
            separator = 0
    }
    var genreList = document.getElementById("genres").value.split("COI")[separator].split(",")
    for (div of idsMovies) {
        var textGenres = ""
        var idsMovie = div.innerText.trim().split(",")
        for (idGenre of idsMovie) {
            for (genre of genreList) {
                if (genre.split("-")[0] == idGenre) {
                    textGenres += genre.split("-")[1] + ", "
                }
            }
        }
        textGenres = textGenres.trimEnd()
        textGenres = textGenres.substring(0, textGenres.length - 1)
        div.innerText = textGenres
    }
}

function changeLanguage(e) {
    if (e) {
        $("#language")[0].value = $("#languages")[0].value
        $("form").submit()
        return
    }
    var separator = 0
    switch ($("#language")[0].value) {
        case 'es':
            separator = 0
            $("#basic_data")[0].innerText = 'Datos básicos'
            $("#filter")[0].innerText = 'Filtros de busqueda'
            $("[for=title]")[0].innerText = 'Título*'
            $("[for=title]").attr("data-bs-title", "Este filtro funciona independientemente de los demás filtros. Si rellena este campo, no se aplicarán los demás filtros (excepto el filtro \"Tipo\").")
            $("[for=genre]")[0].innerText = 'Género'
            $("[for=excludegenre]")[0].innerText = 'Excluir Género'
            $("[for=min_vote]")[0].innerText = 'Mínimo de votos'
            $("[for=min_avg]")[0].innerText = 'Valoración mínima'
            $("[for=sort_by]")[0].innerText = 'Ordenar por'
            $("[for=type]")[0].innerText = 'Tipo'
            $("[type='submit']")[0].value = 'Enviar'
            $('#genre')
                .find('option')
                .remove().end().append($('<option>', {
                    value: '',
                    text: 'Cualquiera'
                }));
            $("#sort_by option")[0].text = 'Popularidad'
            $("#sort_by option")[1].text = 'Fecha Lanzamiento'
            $("#sort_by option")[2].text = 'Nota media'
            $("#sort_by option")[3].text = 'Número de votos'
            $("#type option")[0].text = 'Películas'
            $("#type option")[1].text = 'Series'
            $.each($(".rentText"), function (i, item) {
                item.innerText = 'Alquilar'
            })
            $.each($(".whereText"), function (i, item) {
                item.innerText = 'Ver ahora'
            })
            $.each($(".buyText"), function (i, item) {
                item.innerText = 'Comprar'
            })
            $.each($(".suscriptionText"), function (i, item) {
                item.innerText = 'Suscripción'
            })
            $.each($(".freeText"), function (i, item) {
                item.innerText = 'Gratis'
            })
            $.each($(".btn-info"), function (i, item) {
                item.innerText = '🔔 Avísame cuando esté disponible'
            })
            $("#closeModalButton")[0].innerText = 'Cerrar'
            $("#saveModalButton")[0].innerText = 'Guardar'
            $("[for=watchproviders]")[0].innerText = 'Plataforma'
            $("#watchproviders option")[0].innerText = 'Indeferente'
            $("#watchproviders option")[$("#watchproviders option").length - 1].innerText = 'Cualquiera'
            $("[for=people]")[0].innerText = 'Persona'
            break;
        case 'en':
            separator = 1
            $("#basic_data")[0].innerText = 'Basic data'
            $("#filter")[0].innerText = 'Search filters'
            $("[for=title]")[0].innerText = 'Title*'
            $("[for=title]").attr("data-bs-title", "This filter works independently from the other filters. If you fill in this field, the other filters (except for the \"Type\" filter) will not be applied...")
            $("[for=genre]")[0].innerText = 'Genre'
            $("[for=excludegenre]")[0].innerText = 'Exclude Genre'
            $("[for=min_vote]")[0].innerText = 'Minimum votes'
            $("[for=min_avg]")[0].innerText = 'Minimum rate'
            $("[for=sort_by]")[0].innerText = 'Sort by'
            $("[for=type]")[0].innerText = 'Type'
            $("[type='submit']")[0].value = 'Send'
            $('#genre')
                .find('option')
                .remove().end().append($('<option>', {
                    value: '',
                    text: 'Whichever'
                }));
            $("#sort_by option")[0].text = 'Popularity'
            $("#sort_by option")[1].text = 'Release date'
            $("#sort_by option")[2].text = 'Average rate'
            $("#sort_by option")[3].text = 'Number of votes'
            $("#type option")[0].text = 'Movies'
            $("#type option")[1].text = 'Series'
            if ($("#results").length == 1) {
                $("#results")[0].innerText = 'Results'
            }
            $.each($(".rentText"), function (i, item) {
                item.innerText = 'Rent'
            })
            $.each($(".whereText"), function (i, item) {
                item.innerText = 'See now'
            })
            $.each($(".buyText"), function (i, item) {
                item.innerText = 'Buy'
            })
            $.each($(".suscriptionText"), function (i, item) {
                item.innerText = 'Suscription'
            })
            $.each($(".freeText"), function (i, item) {
                item.innerText = 'Free'
            })
            $.each($(".btn-info"), function (i, item) {
                item.innerText = '🔔 Notify me when it\'s available'
            })
            $("#closeModalButton")[0].innerText = 'Close'
            $("#saveModalButton")[0].innerText = 'Save'
            $("[for=watchproviders]")[0].innerText = 'Provider'
            $("#watchproviders option")[0].innerText = 'Indifferent'
            $("#watchproviders option")[$("#watchproviders option").length - 1].innerText = 'Whichever'
            $("[for=people]")[0].innerText = 'Person'
            break;
        case 'de':
            separator = 2
            $("#basic_data")[0].innerText = 'Grundlegende Daten'
            $("#filter")[0].innerText = 'Suchfilter'
            $("[for=title]")[0].innerText = 'Titel*'
            $("[for=title]").attr("data-bs-title", "Dieser Filter arbeitet unabhängig von den anderen Filtern. Wenn Sie dieses Feld ausfüllen, werden die anderen Filter (mit Ausnahme des Filters \"Typ\") nicht angewendet.")
            $("[for=genre]")[0].innerText = 'Genre'
            $("[for=excludegenre]")[0].innerText = 'Genre ausschließen'
            $("[for=min_vote]")[0].innerText = 'Mindeststimmen'
            $("[for=min_avg]")[0].innerText = 'Mindestsatz'
            $("[for=sort_by]")[0].innerText = 'Sortieren nach'
            $("[for=type]")[0].innerText = 'Typ'
            $("[type='submit']")[0].value = 'Senden'
            $('#genre')
                .find('option')
                .remove().end().append($('<option>', {
                    value: '',
                    text: 'Alle'
                }));

            $("#sort_by option")[0].text = 'Popularität'
            $("#sort_by option")[1].text = 'Veröffentlichungsdatum'
            $("#sort_by option")[2].text = 'Durchschnittsnote'
            $("#sort_by option")[3].text = 'Anzahl Stimmen'
            $("#type option")[0].text = 'Filme'
            $("#type option")[1].text = 'Serie'
            if ($("#results").length == 1) {
                $("#results")[0].innerText = 'Ergebnisse'
            }
            $.each($(".rentText"), function (i, item) {
                item.innerText = 'Miete'
            })
            $.each($(".whereText"), function (i, item) {
                item.innerText = 'Siehe jetzt'
            })
            $.each($(".buyText"), function (i, item) {
                item.innerText = 'Kaufen'
            })
            $.each($(".suscriptionText"), function (i, item) {
                item.innerText = 'Abonnement'
            })
            $.each($(".freeText"), function (i, item) {
                item.innerText = 'Frei'
            })
            $.each($(".btn-info"), function (i, item) {
                item.innerText = '🔔 Benachrichtigen Sie mich, wenn es verfügbar ist'
            })
            $("#closeModalButton")[0].innerText = 'Schließen'
            $("#saveModalButton")[0].innerText = 'Speichern'
            $("[for=watchproviders]")[0].innerText = 'Anbieter'
            $("#watchproviders option")[0].innerText = 'Gleichgültig'
            $("#watchproviders option")[$("#watchproviders option").length - 1].innerText = 'Alle'
            $("[for=people]")[0].innerText = 'Person'
            break;
    }
    $("#languages")[0].selectedIndex = separator
    var genreValue = document.getElementById("genreValue").value
    chargeGenresSelect(separator, '#genre', genreValue)
    var excludeGenreValue = document.getElementById("excludeGenreValue").value
    chargeGenresSelect(separator, '#excludegenre', excludeGenreValue)
    loadTooltips()
}

function chargeGenresSelect(separator, selectID, valueSelect) {
    $.each(document.getElementById("genres").value.split("COI")[separator].split(","), function (i, item) {
        if (valueSelect == item.split("-")[0]) {
            $(selectID).append($('<option>', {
                value: item.split("-")[0],
                text: item.split("-")[1],
                selected: 'selected'
            }));
        } else {
            $(selectID).append($('<option>', {
                value: item.split("-")[0],
                text: item.split("-")[1]
            }));
        }

    })
}