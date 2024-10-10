<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="inicio.aspx.cs" Inherits="map_api.inicio" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

    <!-- título de la página -->
    <title>Google maps picker</title>

    <!-- Boostrap y jQuery-->
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css"/>
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="https://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

    <!-- Complemento -->
    <script type="text/javascript" src='https://maps.google.com/maps/api/js?sensor=false&libraries=places&key=AIzaSyDlv2PNwLztXH4VUYD9J9jW5vuv-T6YzRs'></script>

    <!-- javaScript - locationpicker.jquery.js -->
    <script src="javaScript/locationpicker.jquery.js"></script>
    <!-- style -->

</head>

<body>

    <form id="form1" runat="server">

        <!-- contenido -->
        <div class="container">

            <!-- boton para modal -->
            <button type="button" class="btn btn-default" data-toggle="modal" data-target="#ModalMap">

                <!-- - class="glyphicon glyphicon-map-marker": icono -->
                <span class="glyphicon glyphicon-map-marker"></span><span id="ubicacion"> Seleccionar ubicación</span>

            </button>

            <!-- proviniente del jScript -->
            <style>
                .pac-container {
                    z-index:99999;
                }
            </style>

            <!-- modal -->
            <div class="modal fade" id="ModalMap" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">

                    <!-- contenido del modal -->
                    <div class="modal-content">
                        <!-- cuerpo del modal-->
                        <div class="modal-body">
                            <div class="form-horizontal">
                                <div class="form-group">

                                    <!-- ingresaremos dirección -->
                                    <label class="col-sm-2">Ubicación</label>
                                    <div class="col-sm-9">
                                        <asp:TextBox ID="ModalMapaddress" runat="server" CssClass="form-control"></asp:TextBox>
                                    </div>

                                    <!-- cerrar modal -->
                                    <div class="col-sm-1">
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>

                                </div>

                                <!-- mapa -->
                                <div id="ModalMapPreview" style="width:100%; height:400px"></div>
                                <div class="clearfix">&nbsp;</div>

                                <!-- para guardar la latitud y longitud -->
                                <div class="m-t-small">

                                    <!-- latitud -->
                                    <label class="p-r-small col-sm-1 control-label">Latitud: </label>
                                    <div class="col-sm-3">
                                        <asp:TextBox ID="ModalMapLat" CssClass="form-control" runat="server"></asp:TextBox>
                                    </div>

                                    <!-- longitud -->
                                    <label class="p-r-small col-sm-1 control-label">Latitud: </label>
                                    <div class="col-sm-3">
                                        <asp:TextBox ID="ModalMapLong" CssClass="form-control" runat="server"></asp:TextBox>
                                    </div>

                                    <div class="col-sm-3">
                                        <button type="button" class="btn btn-primary btn-block" data-dismiss="modal">Aceptar</button>
                                    </div>

                                    <div class="clearfix"></div>

                                </div>

                                <script>
                                    /* muestra el mapa */
                                    $('#ModalMapPreview').locationpicker({

                                        /* buscador */
                                        inputBinding: {
                                            latitudeInput: $('#<%=ModalMapLat.ClientID%>'),
                                            longitudeInput: $('#<%=ModalMapLong.ClientID%>'),
                                            locationNameInput: $('#<%=ModalMapaddress.ClientID%>')
                                        },
                                        /* guarda la ultima ubicación marcada */
                                        onchanged: function (currentLocation, radius, isMarkerDropped) {
                                            $('#ubicacion').html($('#<%=ModalMapaddress.ClientID%>').val());
                                        }

                                    }); 

                                    $('ModalMap').on('show.bs.modal', function () {
                                        $('#ModalMapPreview').locationpicker('autosize');
                                    })
                                </script>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    </form>

</body>

</html>
