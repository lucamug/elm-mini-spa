module ExampleSPA exposing (main)

import Color
import Element exposing (..)
import Element.Background as Background
import Element.Font as Font
import Html
import Html.Attributes
import Navigation
import UrlParser exposing ((</>))
import Window


-- PAGES VIEWS


viewPageHome : Model -> Element Msg
viewPageHome _ =
    el
        [ width fill
        , height fill
        , Background.image "images/back-foliage.jpg"
        ]
    <|
        none


viewPageContact : Model -> Element Msg
viewPageContact _ =
    el
        [ width fill
        , height fill
        , Background.image "images/back-bridge.jpg"
        ]
    <|
        none


viewPageAbout : Model -> Element Msg
viewPageAbout _ =
    el
        [ width fill
        , height fill
        , Background.image "images/back-couple.jpg"
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
        column [] [ viewMenu model, viewBody model ]


viewMenu : Model -> Element Msg
viewMenu model =
    row
        [ alpha 0.5
        , spacing 10
        , padding 10
        ]
        [ link [] { url = routeToString <| RouteHome, label = text "Home" }
        , link [] { url = routeToString <| RouteAbout, label = text "About" }
        , link [] { url = routeToString <| RouteContact, label = text "Contact" }
        , text <| toString model.windowSize.width
        , text <| toString model.windowSize.height
        , text <| model.mode
        ]


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
    | MsgChangeWindowSize { width : Int, height : Int }


type alias Flag =
    { width : Int
    , height : Int
    , mode : String
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        MsgChangeWindowSize windowSize ->
            ( { model | windowSize = windowSize }, Cmd.none )

        MsgChangeLocation location ->
            ( { model | location = location }, Cmd.none )


init : Flag -> Navigation.Location -> ( Model, Cmd Msg )
init flag location =
    ( { location = location
      , mode = flag.mode
      , windowSize = { width = flag.width, height = flag.height }
      }
    , Cmd.none
    )


type alias Model =
    { location : Navigation.Location
    , windowSize : Window.Size
    , mode : String
    }


inLineStyle : String -> String -> Attribute Msg
inLineStyle name value =
    htmlAttribute (Html.Attributes.style [ ( name, value ) ])


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Window.resizes MsgChangeWindowSize
        ]


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


routeRoot : String
routeRoot =
    "#/"


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
    if String.isEmpty location.hash then
        Just RouteHome
    else
        UrlParser.parseHash route location
