/*! jquery-locationpicker - v0.1.16 - 2017-10-02 */
(function ($)
{

    /* función que crea el contexto del mapa de Google */
    function GMapContext(domElement, options)
    {

        /* inicializa el mapa de Google con el elemento del DOM y las opciones */
        var _map = new google.maps.Map(domElement, options);

        /* crea un marcador en el mapa con las opciones dadas */
        var _marker = new google.maps.Marker({
            /* posición inicial del marcador */
            position: new google.maps.LatLng(27.4827, -109.9306),
            /* mapa donde se coloca el marcador */
            map: _map,
            /* texto del marcador */
            title: "Obre York",
            /* visibilidad de marcador */
            visible: options.markerVisible,
            /* arrastre del marcador */
            draggable: options.markerDraggable,
            /* icono */
            icon: options.markerIcon !== undefined ? options.markerIcon : undefined
        });

        /* devuelve el objeto */
        return{

            map: _map,
            marker: _marker,
            /* inicialmente no hay círculo */
            circle: null,
            /* posición actual del marcador */
            location: _marker.position,
            /* radio del círculo */
            radius: options.radius,
            /* nombre de la ubicación */
            locationName: options.locationName,
            addressComponents:
            {

                /* dirección completa */
                formatted_address: null,
                /* primera línea de la dirección */
                addressLine1: null,
                /* segunda línea de la dirección */
                addressLine2: null,
                /* nombre de la calle */
                streetName: null,
                /* número */
                streetNumber: null,
                /* ciudad */
                city: null,
                /* distrito */
                district: null,
                /* estado */
                state: null,
                /* estado o provincia */
                stateOrProvince: null
            },

            /* configuraciones adicionales */
            settings: options.settings,
            /* elemento DOM que contiene el mapa */
            domContainer: domElement,
            /* geocoder para obtener direcciones */
            geodecoder: new google.maps.Geocoder()

        };

    }

    /* utilidades para trabajar con Google Maps */
    var GmUtility = {

        /* dibuja un círculo en el mapa alrededor de la ubicación */
        drawCircle: function (gmapContext, center, radius, options)
        {

            /* si es diferente a nulo */
            if (gmapContext.circle != null)
            {

                /* elimina el círculo previo si existe */
                gmapContext.circle.setMap(null);

            }

            if (radius > 0)
            {

                /* convierte el radio a un número si no lo es */
                radius *= 1;
                options = $.extend({
                    /* color del borde */
                    strokeColor: "#0000FF",
                    /* opacidad del borde */
                    strokeOpacity: .35,
                    /* grosor del borde */
                    strokeWeight: 2, 
                    /* color de relleno */
                    fillColor: "#0000FF",
                    /* opacidad del relleno */
                    fillOpacity: .2
                }, options);

                /* aplica las opciones al círculo y lo dibuja en el mapa */
                options.map = gmapContext.map;
                options.radius = radius;
                options.center = center;
                gmapContext.circle = new google.maps.Circle(options);
                return gmapContext.circle;

            }

            return null;

        },

        /* establece la posición del marcador y actualiza el círculo */
        setPosition: function (gMapContext, location, callback)
        {

            /* actualiza la posición del marcador */
            gMapContext.location = location;
            /* mueve el marcador a la nueva ubicación */
            gMapContext.marker.setPosition(location);
            /* mueve el mapa a la nueva ubicación */
            gMapContext.map.panTo(location);
            /* dibuja el círculo en la nueva ubicación */
            this.drawCircle(gMapContext, location, gMapContext.radius, {}); 

            /* si está habilitado el geocodificado inverso, actualiza el nombre de la ubicación */
            if (gMapContext.settings.enableReverseGeocode)
            {

                this.updateLocationName(gMapContext, callback);

            }
            else
            {

                if (callback)
                {

                    /* llama al callback si existe */
                    callback.call(this, gMapContext);

                }

            }

        },

        /* convierte un objeto LatLng a un formato más simple con latitud y longitud */
        locationFromLatLng: function (lnlg)
        {

            return {
                latitude: lnlg.lat(),
                longitude: lnlg.lng()
            };

        },

        /* obtiene una dirección a partir del formato especificado */
        addressByFormat: function (addresses, format)
        {

            var result = null;

            for (var i = addresses.length - 1; i >= 0; i--)
            {
                if (addresses[i].types.indexOf(format) >= 0)
                {
                    result = addresses[i];
                }
            }

            return result || addresses[0];

        },

        /* actualiza el nombre de la ubicación basado en la latitud y longitud actuales */
        updateLocationName: function (gmapContext, callback)
        {

            gmapContext.geodecoder.geocode({
                latLng: gmapContext.marker.position
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    var address = GmUtility.addressByFormat(results, gmapContext.settings.addressFormat);
                    /* asigna la dirección formateada */
                    gmapContext.locationName = address.formatted_address;
                    gmapContext.addressComponents = GmUtility.address_component_from_google_geocode(address.address_components);
                } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    /* si se supera el límite de consultas, intenta de nuevo después de un tiempo */
                    return setTimeout(function () {
                        GmUtility.updateLocationName(gmapContext, callback);
                    }, 1e3);
                }
                if (callback) {
                    callback.call(this, gmapContext);
                }
            });

        },

        /* obtiene los componentes de la dirección a partir de los resultados del geocodificador de Google */
        address_component_from_google_geocode: function (address_components)
        {

            /* almacena los componentes de la dirección */
            var result = {};

            /* recorre el arreglo de componentes de dirección "address_components" desde el ultimo hasta el primerp */
            for (var i = address_components.length - 1; i >= 0; i--)
            {

                /* toma el compoente de dirrección actual */
                var component = address_components[i];

                /* verifica el contenido */
                if (component.types.indexOf("postal_code") >= 0)
                {
                    /* almacena el contenido */
                    result.postalCode = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("street_number") >= 0)
                {
                    /* almacena el contenido */
                    result.streetNumber = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("route") >= 0)
                {
                    /* almacena el contenido */
                    result.streetName = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("locality") >= 0)
                {
                    /* almacena el contenido */
                    result.city = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("sublocality") >= 0)
                {
                    /* almacena el contenido */
                    result.district = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("administrative_area_level_1") >= 0)
                {
                    /* almacena el contenido */
                    result.stateOrProvince = component.short_name;
                }
                /* verifica el contenido */
                else if (component.types.indexOf("country") >= 0)
                {
                    /* almacena el contenido */
                    result.country = component.short_name;
                }

            }

            /* asigna líneas de dirección */
            result.addressLine1 = [result.streetNumber, result.streetName].join(" ").trim();
            result.addressLine2 = "";
            return result;

        }

    };

    /* función para verificar si el plugin está aplicado en el elemento */
    function isPluginApplied(domObj)
    {

        /* sevuelve verdadero si se obtiene un contexto de ubicación para el objeto DOM, si no, devuelve falso */
        return getContextForElement(domObj) != undefined;

    }

    /* función para obtener el contexto del mapa para un elemento DOM */
    function getContextForElement(domObj)
    {

        /* devuelve el contexto del plugin "locationpicker" asociado al objeto DOM */
        return $(domObj).data("locationpicker");

    }

    /* función para actualizar los valores de los inputs asociados al mapa */
    function updateInputValues(inputBinding, gmapContext)

    {
        /* verifiva si inputBinfing esta definido, si no, sale de la función */
        if (!inputBinding) return;

        /* obtiene la ubicación actual del marcador en formato de latitud y longitud */
        var currentLocation = GmUtility.locationFromLatLng(gmapContext.marker.position);

        /* actualiza latitud si está definido */
        if (inputBinding.latitudeInput) {

            /* establece el valor de latitud y dispara un evento de cambio */
            inputBinding.latitudeInput.val(currentLocation.latitude).change();
        }
        /* actualiza longitud si está definido */
        if (inputBinding.longitudeInput) {

            /* establece el valor de latitud y dispara un evento de cambio */
            inputBinding.longitudeInput.val(currentLocation.longitude).change();
        }

        /* actualiza radio si está definido */
        if (inputBinding.radiusInput) {

            /* establece el valor de latitud y dispara un evento de cambio */
            inputBinding.radiusInput.val(gmapContext.radius).change();
        }

        /* actualiza ubicación si está definido */
        if (inputBinding.locationNameInput) {

            /* establece el valor de latitud y dispara un evento de cambio */
            inputBinding.locationNameInput.val(gmapContext.locationName).change();
        }

    }

    /* configura los listeners de eventos para los inputs asociados */
    function setupInputListenersInput(inputBinding, gmapContext)
    {

        /* verifica si esta definido */
        if (inputBinding)
        {

            /* listado para el cambio de radio */
            if (inputBinding.radiusInput)
            {

                /* se establece un evento 'change' en el input de radio */
                inputBinding.radiusInput.on("change", function (e)
                {

                    /* obtiene el valor actual del input de radio */
                    var radiusInputValue = $(this).val();

                    /* verifica si el evento no es original o si el valor no es un número */
                    if (!e.originalEvent || isNaN(radiusInputValue))
                    {

                        /* si no, sale de la función */
                        return; 

                    }

                    /* actualiza el radio */
                    gmapContext.radius = radiusInputValue;

                    /* establece la posición en el mapa con el nuevo radio */
                    GmUtility.setPosition(gmapContext, gmapContext.location, function (context)
                    {

                        /* llama al callback onchanged con la nueva ubicación y radio */
                        context.settings.onchanged.apply(gmapContext.domContainer, [GmUtility.locationFromLatLng(context.location), context.radius, false]);

                    });
                });

            }

            /* listener para el cambio de nombre de la ubicación */
            if (inputBinding.locationNameInput && gmapContext.settings.enableAutocomplete)
            {

                /* variable para rastrear el estado de enfoque del input */
                var blur = false;

                /* inicializa el autocompletado de Google Places en el input de nombre de ubicación */
                gmapContext.autocomplete = new google.maps.places.Autocomplete(inputBinding.locationNameInput.get(0), gmapContext.settings.autocompleteOptions);

                /* agrega un listado para cuando se selecciona un lugar del autocompletado */
                google.maps.event.addListener(gmapContext.autocomplete, "place_changed", function ()
                {

                    /* reinicia el estado de enfoque al seleccionar un lugar */
                    blur = false;

                    /* obtiene el lugar seleccionado */
                    var place = gmapContext.autocomplete.getPlace();

                    /* Si no se encuentra la geometría del lugar, ejecuta la función de ubicación no encontrada */
                    if (!place.geometry)
                    {
                        gmapContext.settings.onlocationnotfound(place.name);
                        return;
                    }

                    /* establece la posición del marcador en la ubicación del lugar seleccionado */
                    GmUtility.setPosition(gmapContext, place.geometry.location, function (context)
                    {

                        /* actualiza los valores de los inputs asociados */
                        updateInputValues(inputBinding, context);
                        /* llama a la función onchanged con los nuevos valores de ubicación y radio */
                        context.settings.onchanged.apply(gmapContext.domContainer, [GmUtility.locationFromLatLng(context.location), context.radius, false]);

                    });
                });

                /* si se permite el desenfoque del autocompletado */
                if (gmapContext.settings.enableAutocompleteBlur)
                {

                    /* cambio en el input de nombre de ubicación */
                    inputBinding.locationNameInput.on("change", function (e) {

                        /* si no es un evento original */
                        if (!e.originalEvent)
                        {

                            /* no devuelve nada */
                            return;

                        }

                        /* marca el input como desenfocado */
                        blur = true;

                    });

                    /* desenfoque del input de nombre de ubicación */
                    inputBinding.locationNameInput.on("blur", function (e) {

                        /* si no es un evento original */
                        if (!e.originalEvent) {

                            /* no devuelve nada */
                            return;

                        }

                        setTimeout(function ()
                        {

                            /* obtiene el valor del input */
                            var address = $(inputBinding.locationNameInput).val();

                            /* si la direccion es mas larga que 5 y el input ha sudo desenfocado */
                            if (address.length > 5 && blur)
                            {

                                /* reinicia el estado de desenfoque */
                                blur = false;

                                /* realiza la geocodificación para convertir la dirección en coordenadas */
                                gmapContext.geodecoder.geocode({
                                    address: address

                                }, function (results, status)
                                {
                                    /* si la geocodificación es exitosa y hay resultados */
                                    if (status == google.maps.GeocoderStatus.OK && results && results.length)
                                    {

                                        /* establece la posición del marcador en la ubicación de los resultados */
                                        GmUtility.setPosition(gmapContext, results[0].geometry.location, function (context)
                                        {

                                            /* actualiza los valores de los inputs asociados */
                                            updateInputValues(inputBinding, context);
                                            /* llama a la función onchanged con los nuevos valores de ubicación y radio */
                                            context.settings.onchanged.apply(gmapContext.domContainer, [GmUtility.locationFromLatLng(context.location), context.radius, false]);

                                        });
                                    }
                                });
                            }

                            /* retraso de 1 seg antes de ejecutar el bloque */
                        }, 1e3);
                    });
                }
            }
            /* verifica si existe el input de latitud */
            if (inputBinding.latitudeInput)
            {

                /* configura el evento 'change' en el input de latitud */
                inputBinding.latitudeInput.on("change", function (e)
                {

                    /* obtiene el valor del input de latitud */
                    var latitudeInputValue = $(this).val();

                    /* verifica si el evento es original y si el valor es un número */
                    if (!e.originalEvent || isNaN(latitudeInputValue)) {

                        /* no devuelve nada */
                        return;

                    }

                    /* establece la nueva posición del marcador con la latitud ingresada */
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(latitudeInputValue, gmapContext.location.lng()), function (context) {

                        /* llama a la función de callback onchanged con la nueva ubicación y radio */
                        context.settings.onchanged.apply(gmapContext.domContainer, [GmUtility.locationFromLatLng(context.location), context.radius, false]);
                        /* actualiza los valores de los inputs asociados al mapa */
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);

                    });
                });
            }

            /* verifica si existe el input de longitud */
            if (inputBinding.longitudeInput)
            {

                /* configura para el evento 'change' en el input de longitud */
                inputBinding.longitudeInput.on("change", function (e)
                {

                    /* obtiene el valor del input de longitud */
                    var longitudeInputValue = $(this).val();

                    /* verifica si el evento es original y si el valor es un número */
                    if (!e.originalEvent || isNaN(longitudeInputValue)) {

                        /* no devuelve nada */
                        return;

                    }

                    /* establece la nueva posición del marcador con la longitud ingresada */
                    GmUtility.setPosition(gmapContext, new google.maps.LatLng(gmapContext.location.lat(), longitudeInputValue), function (context)
                    {

                        /* llama a la función de callback onchanged con la nueva ubicación y radio */
                        context.settings.onchanged.apply(gmapContext.domContainer, [GmUtility.locationFromLatLng(context.location), context.radius, false]);
                        /* actualiza los valores de los inputs asociados al mapa */
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);

                    });
                });
            }

        }
    }

    /* function autosize: ajusta el tamaño del mapa cuando se redimensiona la ventana o el contenedor del mapa.
     *  Llama al evento 'resize' de Google Maps y luego centra el mapa en la posición actual del marcador */
    function autosize(gmapContext)
    {

        /* evento 'resize' para ajustar el mapa */
        google.maps.event.trigger(gmapContext.map, "resize");

        /* centra el mapa en la posición actual del marcador */
        setTimeout(function () {
            gmapContext.map.setCenter(gmapContext.marker.position);

            /* retraso de 300 ms */
        }, 300);
    }

    /* function updateMap: actualiza la ubicación y el radio del mapa cuando cambian los valores configurados
     * combina las opciones predeterminadas del mapa con las nuevas opciones proporcionadas */
    function updateMap(gmapContext, $target, options)
    {

        /* actualiza las opciones antiguas con las nuevas */
        var settings = $.extend({}, $.fn.locationpicker.defaults, options),
        /* nueva latitud configurada */
        latNew = settings.location.latitude,
        /* nueva longitud configurada */
        lngNew = settings.location.longitude
        /* nuevo rasio configurado */
        radiusNew = settings.radius,
        /* latitud anterior */
        latOld = gmapContext.settings.location.latitude,
        /* longitud anterior */
        lngOld = gmapContext.settings.location.longitude,
        /* radio anterior */
        radiusOld = gmapContext.settings.radius;

        /* si todo es igual, no hacer nada */
        if (latNew == latOld && lngNew == lngOld && radiusNew == radiusOld) return;

        /* si no, actualiza */
        gmapContext.settings.location.latitude = latNew;
        gmapContext.settings.location.longitude = lngNew;
        gmapContext.radius = radiusNew;

        /* establece la nueva posición en el mapa con las nuevas coordenadas */
        GmUtility.setPosition(gmapContext, new google.maps.LatLng(gmapContext.settings.location.latitude, gmapContext.settings.location.longitude), function (context) {
            setupInputListenersInput(gmapContext.settings.inputBinding, gmapContext);
            context.settings.oninitialized($target);
        });
    }

    /* permite aplicar y controlar diferentes operaciones sobre un elemento DOM que contiene un mapa de Google
     * options: puede ser un string que representa el comando a ejecutar o un objeto con las opciones de configuración
     * params: parámetros adicionales para el comando, si es necesario */
    $.fn.locationpicker = function (options, params)
    {

        /* options es un string, se interpreta como un comando */
        if (typeof options == "string")
        {

            /* obtiene el primer elemento DOM al que se aplica el plugin */
            var _targetDomElement = this.get(0);

            /* verifica que fue aplicado */
            if (!isPluginApplied(_targetDomElement)) return;

            /* obtiene el contexto del mapa asociado al elemento */
            var gmapContext = getContextForElement(_targetDomElement);

            /* según el valor el valor de options */
            switch (options)
            {

                /* case "location":
                 * si no hay parametros, muestra la ubicación actual 
                 * si hay parametros, actualiza la ubicación */
                case "location":


                    if (params == undefined)
                    {

                        var location = GmUtility.locationFromLatLng(gmapContext.location);
                        location.radius = gmapContext.radius;
                        location.name = gmapContext.locationName;

                        /* devuelve la ubicación actual */
                        return location;

                    }
                    else
                    {

                        if (params.radius)
                        {
                            gmapContext.radius = params.radius;
                        }

                        /* establece a la nueva ubicación en el mapa */
                        GmUtility.setPosition(gmapContext, new google.maps.LatLng(params.latitude, params.longitude), function (gmapContext)
                        {

                            /* actualiza los valores */
                            updateInputValues(gmapContext.settings.inputBinding, gmapContext);

                        });

                    }

                    break;

                /* case "subscribe":
                 * permite realizar movimientos o click con un callback */
                case "subscribe":

                    if (params == undefined)
                    {
                        return null;
                    }
                    else
                    {

                        var event = params.event;
                        var callback = params.callback;

                        /* verifica que se realiza el evento y el callback */
                        if (!event || !callback)
                        {
                            console.error('LocationPicker: Invalid arguments for method "subscribe"');
                            return null;
                        }

                        /* agrega para el evento especificado en el mapa */
                        google.maps.event.addListener(gmapContext.map, event, callback);

                    }
                    break;

                /* case "map": 
                 * si no se porporcionan parámetros, devuelve el mapa actual, junto con el marcador y ubicación*/
                case "map":

                    if (params == undefined)
                    {
                        var locationObj = GmUtility.locationFromLatLng(gmapContext.location);
                        locationObj.formattedAddress = gmapContext.locationName;
                        locationObj.addressComponents = gmapContext.addressComponents;

                        return {

                            /* devuelve el mapa actual */
                            map: gmapContext.map,
                            /* devuelve el marcador actual */
                            marker: gmapContext.marker,
                            /* devuelve la ubicación formateada y los componentes de la dirección */
                            location: locationObj

                        };

                    }
                    else
                    {
                        return null;
                    }

                /* case "autosize": 
                 * ajusta el tamaño del mapa */
                case "autosize":

                    /* manda a llamar a la función autosize para ajustar el mapa */
                    autosize(gmapContext);
                    return this;

            }

            return null;

        }

        /* aplica el plugin "locationpicker" a cada elemento del selector jQuey */
        return this.each(function ()
        {

            /* guarda el elemento acutal como objeto jQuery */
            var $target = $(this);
            if (isPluginApplied(this))
            {

                /* actualiza el mapa si ya fue iniciado */
                updateMap(getContextForElement(this), $(this), options);
                return;

            }

            /* combina las opciones predeterminadas con las nuevas opciones proporciondas */
            var settings = $.extend({}, $.fn.locationpicker.defaults, options);

            /* opciones de mapa */
            var gmapContext = new GMapContext(this, $.extend({}, {

                /* zoom inicial */
                zoom: settings.zoom, 
                /* coordenadas iniciales */
                center: new google.maps.LatLng(settings.location.latitude, settings.location.longitude),
                /* tipo de mapa */
                mapTypeId: settings.mapTypeId,
                /* control de tipo de mapa */
                mapTypeControl: false,
                /* estilos del mapa */
                styles: settings.styles,
                /* zoom con doble click */
                disableDoubleClickZoom: false,
                /* zoom con la rueda del mouse */
                scrollwheel: settings.scrollwheel,
                /* vista de calle */
                streetViewControl: false,
                /* radio */
                radius: settings.radius,
                /* nombre de la ubicación inicial */
                locationName: settings.locationName,
                /* opciones */
                settings: settings,
                /* opciones para el autocompletado de direcciones */
                autocompleteOptions: settings.autocompleteOptions,
                /* formato de dirección */
                addressFormat: settings.addressFormat,
                /* define si el mapa es arrastrable */
                draggable: settings.draggable,
                /* icono del marcador */
                markerIcon: settings.markerIcon, 
                /* define si el marcador es arrastable */
                markerDraggable: settings.markerDraggable, 
                /* define si el marcador es visible */
                markerVisible: settings.markerVisible

                /* fusiona las opciones adicionales del mapa */
            }, settings.mapOptions));

            /*  */
            $target.data("locationpicker", gmapContext);

            /* function displayMarkerWithSelectedArea(): actualiza el marcador y la ubicación seleccionada */
            function displayMarkerWithSelectedArea()
            {

                GmUtility.setPosition(gmapContext, gmapContext.marker.position, function (context)
                {

                    /* convierte las coordenadas en un objeto de ubicación */
                    var currentLocation = GmUtility.locationFromLatLng(gmapContext.location);
                    /* actualiza los valores de los inputs */
                    updateInputValues(gmapContext.settings.inputBinding, gmapContext);
                    /* llama al callback onchanged del ususario para notificar sobre la nueva ubicación */
                    context.settings.onchanged.apply(gmapContext.domContainer, [currentLocation, context.radius, true]);

                });

            }

            /* si la opción markerInCenter está activada, mueve el marcador al centro del mapa cuando los límites cambian */
            if (settings.markerInCenter)
            {

                gmapContext.map.addListener("bounds_changed", function ()
                {

                    if (!gmapContext.marker.dragging)
                    {

                        /* actualiza la posición del marcador al centro del mapa */
                        gmapContext.marker.setPosition(gmapContext.map.center);
                        /* actualiza los inputs */
                        updateInputValues(gmapContext.settings.inputBinding, gmapContext);

                    }

                });

                /* cuando el mapa está "en reposo" (idle), asegura que el marcador esté en la posición correcta */
                gmapContext.map.addListener("idle", function ()
                {

                    if (!gmapContext.marker.dragging)
                    {

                        /* actualiza la visualización de la ubicación seleccionada */
                        displayMarkerWithSelectedArea();

                    }

                });

            }

            /* evento cuando se arrastra el marcador */
            google.maps.event.addListener(gmapContext.marker, "drag", function (event)
            {

                /* actualiza los inputs mientras el marcador es arrastrado */
                updateInputValues(gmapContext.settings.inputBinding, gmapContext);

            });

            /* evento cuando se deje de arrastrar el marcador */
            google.maps.event.addListener(gmapContext.marker, "dragend", function (event)
            {

                /* actualiza la ubicación seleccionada y la visualización al finalizar el arrastre */
                displayMarkerWithSelectedArea();

            });

            /* establece la posición inicial del mapa */
            GmUtility.setPosition(gmapContext, new google.maps.LatLng(settings.location.latitude, settings.location.longitude), function (context)
            {

                /* actualiza los inputs con la posición inicial */
                updateInputValues(settings.inputBinding, gmapContext);
                /* configura los listeners para los inputs */
                setupInputListenersInput(settings.inputBinding, gmapContext);
                /* llama al callback oninitialized cuando el mapa se inicializa */
                context.settings.oninitialized($target);

            });

        });

    };

    /* configuración predeterminada */
    $.fn.locationpicker.defaults = {

        /* ubicación inicial */
        location: {

            /* latitud predeterminada */
            latitude: 27.4827,
            /* longitud predeterminada */
            longitude: -109.9306

        },

        /* nombre predeterminada */
        locationName: "",
        /* radio predeterminada */
        radius: 0,
        /* zoom predeterminada */
        zoom: 15,
        /* tipo de mapa predeterminada */
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        /* estilos para el mapa */
        styles: [],
        /* opciones para el mapa */
        mapOptions: {},
        /* permite el desplazamiento con la rueda del mouse */
        scrollwheel: true,

        /* vinculación de inputs para la latitud, longitud, radio y nombre de ubicación */
        inputBinding: {

            /* input para latitud */
            latitudeInput: null,
            /* input para longitud */
            longitudeInput: null,
            /* input para el radio */
            radiusInput: null,
            /* input para la ubicación */
            locationNameInput: null
        },

        /* autocompletado */
        enableAutocomplete: true,
        /* desenfoque */
        enableAutocompleteBlur: false,
        /* opciones para el autocompletado */
        autocompleteOptions: null, 
        /* formato de dirección */
        addressFormat: "postal_code",
        /* geocodificación inversa */
        enableReverseGeocode: true,
        /* arrastrar el marcador */
        draggable: true,
        /* callback al cambiar la ubicación */
        onchanged: function (currentLocation, radius, isMarkerDropped) { }, 
        /* callback si no se encuentra la ubicación */
        onlocationnotfound: function (locationName) { },
        /* callback al inicializar el componente */
        oninitialized: function (component) { },
        /* icono del marcador */
        markerIcon: undefined, 
        /* marcador arrastrable */
        markerDraggable: true,
        /* marcador visible0 */
        markerVisible: true 

    };
})(jQuery);