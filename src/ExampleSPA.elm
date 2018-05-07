module ExampleSPA exposing (main)

import Color
import Element exposing (..)
import Element.Background as Background
import Element.Font as Font
import Html
import Html.Attributes
import Html.Events
import Json.Decode
import Navigation
import UrlParser exposing ((</>))
import Window


-- PAGES VIEWS


viewPageHome : Model -> Element Msg
viewPageHome _ =
    el
        [ width fill
        , height fill
        , Background.image "images/bg02.jpg"
        ]
    <|
        none


viewPageContact : Model -> Element Msg
viewPageContact _ =
    el
        [ width fill
        , height fill
        , Background.image "images/bg01.jpg"
        ]
    <|
        none


viewPageAbout : Model -> Element Msg
viewPageAbout _ =
    el
        [ width fill
        , height fill
        , Background.image "images/bg04.jpg"
        ]
    <|
        none



-- OTHER VIEWS


view : Model -> Html.Html Msg
view model =
    layout
        [ Font.family
            [ Font.external
                { name = "Space Mono"
                , url = "https://fonts.googleapis.com/css?family=Space+Mono"
                }
            , Font.sansSerif
            ]
        , Font.size 16
        , Font.color <| Color.rgb 0x33 0x33 0x33
        , Background.color Color.white
        ]
    <|
        column
            [ Element.inFront <|
                link
                    [ alignRight
                    ]
                    { label = image [ width <| px 60, alpha 0.5 ] { src = "images/github.png", description = "Fork me on Github" }
                    , url = "https://github.com/lucamug/elm-mini-spa"
                    }
            ]
            [ viewMenu model, viewBody model ]


viewMenu : Model -> Element Msg
viewMenu model =
    row
        [ alpha 0.5
        , spacing 10
        , padding 10
        ]
        ([ myLink [] { url = routeToString <| RouteHome, label = text "Home" }
         , myLink [] { url = routeToString <| RouteAbout, label = text "About" }
         , myLink [] { url = routeToString <| RouteContact, label = text "Contact" }
         ]
            ++ (if model.mode == "debug" then
                    [ text <| toString model.windowSize.width
                    , text <| toString model.windowSize.height
                    ]
                else
                    []
               )
        )


viewBody : Model -> Element Msg
viewBody model =
    case maybeRoute model.location of
        Just routeRoute ->
            case routeRoute of
                RouteAbout ->
                    viewPageAbout model

                RouteContact ->
                    viewPageContact model

                RouteHome ->
                    viewPageHome model

        Nothing ->
            viewPageHome model


type Msg
    = MsgChangeLocation Navigation.Location
    | ChangeLocation String
    | MsgChangeWindowSize { width : Int, height : Int }


type alias Flag =
    { width : Int
    , height : Int
    , mode : String
    }



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg |> Debug.log "msg" of
        ChangeLocation location ->
            ( model, Navigation.newUrl location )

        MsgChangeWindowSize windowSize ->
            ( { model | windowSize = windowSize }, Cmd.none )

        MsgChangeLocation location ->
            ( { model | location = location }, Cmd.none )



-- MODEL


type alias Model =
    { location : Navigation.Location
    , windowSize : Window.Size
    , mode : String
    }



-- INIT


init : Flag -> Navigation.Location -> ( Model, Cmd Msg )
init flag location =
    ( { location = location
      , windowSize = { width = flag.width, height = flag.height }
      , mode = flag.mode
      }
    , Cmd.none
    )



-- HELPERS


inLineStyle : String -> String -> Attribute Msg
inLineStyle name value =
    htmlAttribute (Html.Attributes.style [ ( name, value ) ])


myLink : List (Attribute Msg) -> Element.Link Msg -> Element Msg
myLink attributes data =
    link
        ([ onLinkClick data.url
         ]
            ++ attributes
        )
        { url = data.url
        , label = data.label
        }


onLinkClick : String -> Attribute Msg
onLinkClick url =
    htmlAttribute
        (Html.Events.onWithOptions "click"
            { stopPropagation = False
            , preventDefault = True
            }
            (Json.Decode.succeed (ChangeLocation url))
        )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Window.resizes MsgChangeWindowSize
        ]



-- MAIN


main : Program Flag Model Msg
main =
    Navigation.programWithFlags MsgChangeLocation
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- ROUTING --


type Route
    = RouteHome
    | RouteAbout
    | RouteContact


path : { about : String, contact : String }
path =
    { about = "about"
    , contact = "contat"
    }


route : UrlParser.Parser (Route -> a) a
route =
    UrlParser.oneOf
        [ UrlParser.map RouteHome (UrlParser.s "")
        , UrlParser.map RouteAbout (UrlParser.s path.about)
        , UrlParser.map RouteContact (UrlParser.s path.contact)
        ]



-- INTERNAL --


usingHash : Bool
usingHash =
    True


routeRoot : String
routeRoot =
    if usingHash then
        "#/"
    else
        "/"


routeToString : Route -> String
routeToString page =
    let
        pieces =
            case page of
                RouteHome ->
                    []

                RouteAbout ->
                    [ path.about ]

                RouteContact ->
                    [ path.contact ]
    in
    routeRoot ++ String.join "/" pieces


maybeRoute : Navigation.Location -> Maybe Route
maybeRoute location =
    if usingHash then
        if String.isEmpty location.hash then
            Just RouteHome
        else
            UrlParser.parseHash route location
    else if String.isEmpty location.pathname then
        Just RouteHome
    else
        UrlParser.parsePath route location
