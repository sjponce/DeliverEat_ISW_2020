
/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { tryParse } from 'selenium-webdriver/http';
import { } from 'googlemaps';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor() { }
  @ViewChild('selectedPicture', { static: false }) selectedPicture: any;
  @ViewChild('stepperNoAd', { static: false }) stepperNoAd: any;
  @ViewChild('comercioAdheridoGroup', { static: false }) comercioAdheridoGroup: any;
  public map: any;
  public marker: any;
  public locationSelected = false;
  public archivoActual = false;
  public stepOneFormGroup: FormGroup;
  public stepOneFormGroupNA: FormGroup;
  public stepTwoFormGroupNA: FormGroup;
  public stepThreeFormGroupNA: FormGroup;
  public stepTwoFormGroup: FormGroup;
  public stepThreeFormGroup: FormGroup;
  public comercioNoAdheridoForm: FormGroup;
  public comercioNoAdheridoForm2: FormGroup;
  private _formBuilder: FormBuilder = new FormBuilder();
  public headersComercioAdherido: string[] = ['codigo', 'nombre', 'precio', 'opciones'];
  public min = new Date();
  public productosComercioAdherido: any[] = [
    {
      codigo: 'AAAA',
      nombre: 'Pepsi 350ml',
      precio: 50
    },
    {
      codigo: 'BBBB',
      nombre: 'Pancho',
      precio: 100
    },
    {
      codigo: 'CCCC',
      nombre: 'Hamburguesa',
      precio: 150
    }
  ];
  public productosComercioAdheridoSource = new MatTableDataSource(this.productosComercioAdherido);
  public headersCarrito: string[] = ['cantidad', 'codigo', 'nombre', 'precio', 'opciones'];
  public productosCarrito: any[] = [];
  public productosCarritoSource = new MatTableDataSource(this.productosCarrito);
  public aCompra = false;
  public aCompraNA = false;
  public isLinear = true;
  public anios: any[] = [];
  public meses: any[] = [];
  public mapShow = false;
  title = 'grupoCincoDeliverEat';
  ngOnInit() {
    initMap();

    for (let i = 1; i < 13; i++) {
      this.meses.push(i);
    }
    for (let i = 2019; i < 2040; i++) {
      this.anios.push(i);
    }
    this.comercioNoAdheridoForm = this._formBuilder.group({
      detalleCompra: [null, Validators.required],
      foto: [null],
    });
    this.comercioNoAdheridoForm2 = this._formBuilder.group({
      calle: [null, calleValidator(/.*/, this.locationSelected)],
      numero: [null, calleValidator(/.*/, this.locationSelected)],
      ciudad: [null, calleValidator(/.*/, this.locationSelected)],
      referencia: [null],
    });
    this.stepOneFormGroupNA = this._formBuilder.group({
      calle: [null, Validators.required],
      numero: [null, Validators.required],
      ciudad: [null, Validators.required],
      referencia: [null],
    });
    this.stepTwoFormGroupNA = this._formBuilder.group({
      fechaEntregaRadio: ['', Validators.required],
      fechaEntregaDtp: ['', Validators.required],
    });
    this.stepThreeFormGroupNA = this._formBuilder.group({
      formaDePago: ['', Validators.required],
      montoAbonar: ['', [Validators.required, Validators.min(this.calcularTotalCarrito())]],
      nombreTarjeta: ['', Validators.required],
      mes: ['', Validators.required],
      anio: ['', Validators.required],
      codigoSeguridad: ['', [Validators.required, codigoValidator]],
      numeroTarjeta: ['', [Validators.required, visaValidator]]
    });

  }

  agregarAlCarrito(item) {
    let exist = false;
    this.productosCarrito.map(prod => {
      if (prod == item) {
        prod.cantidad = prod.cantidad + 1;
        exist = true;
      }
    });
    if (!exist) {
      item.cantidad = 1;
      this.productosCarrito.push(item);
    }
    this.refreshProductosCarrito();
  }

  sacarDelCarrito(index) {
    if (this.productosCarrito[index].cantidad == 1) {
      this.productosCarrito.splice(index, 1);
    } else {
      this.productosCarrito[index].cantidad = this.productosCarrito[index].cantidad - 1;
    }
    this.refreshProductosCarrito();
  }

  refreshProductosCarrito() {
    this.productosCarritoSource = new MatTableDataSource(this.productosCarrito);
  }

  confirmarCompra() {
    if (this.productosCarrito.length) {
      this.aCompra = true;
      this.stepOneFormGroup = this._formBuilder.group({
        calle: [null, Validators.required],
        numero: [null, Validators.required],
        ciudad: [null, Validators.required],
        referencia: [null],
      });
      this.stepTwoFormGroup = this._formBuilder.group({
        fechaEntregaRadio: ['', Validators.required],
        fechaEntregaDtp: ['', Validators.required],
      });
      this.stepThreeFormGroup = this._formBuilder.group({
        formaDePago: ['', Validators.required],
        montoAbonar: ['', [Validators.required, Validators.min(this.calcularTotalCarrito())]],
        nombreTarjeta: ['', Validators.required],
        mes: ['', Validators.required],
        anio: ['', Validators.required],
        codigoSeguridad: ['', [Validators.required, codigoValidator]],
        numeroTarjeta: ['', [Validators.required, visaValidator]]
      });
    } else {
      alert('Debe tener productos en el carrito!');
    }
  }
  fechaRadioChanged(radio) {
    if (radio === 1) {
      this.stepTwoFormGroupNA.controls['fechaEntregaRadio'].setValidators(Validators.required);
      this.stepTwoFormGroupNA.controls['fechaEntregaRadio'].updateValueAndValidity();
      this.stepTwoFormGroupNA.controls['fechaEntregaDtp'].setValidators(null);
      this.stepTwoFormGroupNA.controls['fechaEntregaDtp'].updateValueAndValidity();
    } else {
      this.stepTwoFormGroupNA.controls['fechaEntregaRadio'].setValidators(null);
      this.stepTwoFormGroupNA.controls['fechaEntregaRadio'].updateValueAndValidity();
      this.stepTwoFormGroupNA.controls['fechaEntregaDtp'].setValidators(Validators.required);
      this.stepTwoFormGroupNA.controls['fechaEntregaDtp'].updateValueAndValidity();
    }
  }

  finalizarCompra() {
    alert('Su pedido se realizo exitósamente!');
    location.reload();
  }

  cancelarCompra() {
    this.aCompra = false;
    this.aCompraNA = false;
    this.productosCarrito = [];
    this.stepperNoAd.reset();
    this.comercioAdheridoGroup.value = 'undefined';
    this.refreshProductosCarrito();
  }

  calcularTotalCarrito() {
    let total = 0;
    this.productosCarrito.map(prod => {
      total += prod.precio * prod.cantidad;
    });
    return total;
  }


  toggleMap() {
    this.mapShow = !this.mapShow;
  }

  generateForm() {

    this.aCompraNA = true;
    this.aCompra = false;
    this.comercioNoAdheridoForm = this._formBuilder.group({
      detalleCompra: [null, Validators.required],
      foto: [null],
    });
    this.comercioNoAdheridoForm2 = this._formBuilder.group({
      calle: [null, Validators.required],
      numero: [null, Validators.required],
      ciudad: [null, Validators.required],
      referencia: [null],
    });
    this.stepOneFormGroupNA = this._formBuilder.group({
      calle: [null, Validators.required],
      numero: [null, Validators.required],
      ciudad: [null, Validators.required],
      referencia: [null],
    });
    this.stepTwoFormGroupNA = this._formBuilder.group({
      fechaEntregaRadio: ['', Validators.required],
      fechaEntregaDtp: ['', Validators.required],
    });
    this.stepThreeFormGroupNA = this._formBuilder.group({
      formaDePago: ['', Validators.required],
      montoAbonar: ['', [Validators.required, Validators.min(this.calcularTotalCarrito())]],
      nombreTarjeta: ['', Validators.required],
      mes: ['', Validators.required],
      anio: ['', Validators.required],
      codigoSeguridad: ['', [Validators.required, codigoValidator]],
      numeroTarjeta: ['', [Validators.required, visaValidator]]
    });


  }
  clearSelectedPicture() {
    this.selectedPicture.nativeElement.value = '';
  }

  click2() {
    this.clearSelectedPicture();
    this.archivoActual = false;
  }

  confirmLocation() {
    this.locationSelected = true;
    this.toggleMap();
    this.comercioNoAdheridoForm2.controls['calle'].setValidators([calleValidator(/.*/, this.locationSelected));
    this.comercioNoAdheridoForm2.controls['calle'].updateValueAndValidity();
    this.comercioNoAdheridoForm2.controls['numero'].setValidators(calleValidator(/.*/, this.locationSelected));
    this.comercioNoAdheridoForm2.controls['numero'].updateValueAndValidity();
    this.comercioNoAdheridoForm2.controls['ciudad'].setValidators(calleValidator(/.*/, this.locationSelected));
    this.comercioNoAdheridoForm2.controls['ciudad'].updateValueAndValidity();

    alert('La ubicación se guardo con exito!');
  }

  deleteLocation() {
    this.locationSelected = false;
    this.comercioNoAdheridoForm2.controls['calle'].setValidators(Validators.required);
    this.comercioNoAdheridoForm2.controls['calle'].updateValueAndValidity();
    this.comercioNoAdheridoForm2.controls['numero'].setValidators(Validators.required);
    this.comercioNoAdheridoForm2.controls['numero'].updateValueAndValidity();
    this.comercioNoAdheridoForm2.controls['ciudad'].setValidators(Validators.required);
    this.comercioNoAdheridoForm2.controls['ciudad'].updateValueAndValidity();
    alert('La ubicación se borro con exito!');
  }
  /* private initMap(): void {
    // Creamos un objeto mapa y especificamos el elemento DOM donde se va a mostrar.
    this.map = new google.maps.Map(document.getElementById('mapa'), {
      zoom: 4,
      center: {lat: -25.363882, lng: 131.044922 }
    });
    // Creamos el marcador
    this.marker = new google.maps.Marker({
        position: { lat: 43.2686751, lng: -2.9340005 },
        draggable: true
    });

    // Le asignamos el mapa a los marcadores.
    this.marker.setMap(this.map);

    google.maps.event.addListener(this.map,'click', function(event) {
      placeMarker(event.latLng,this.map);
    });

    function placeMarker(location, map) {
       var marker = new google.maps.Marker({
           position: location,
           map: map
       });
    }
  } */

  prro() {
    console.log(this.stepTwoFormGroupNA)
  }
  public async archivoSeleccionado(event) {
    this.archivoActual = true;
    const file = event.target.files[0] as File;
    const extension: string = file.name.substring(file.name.lastIndexOf('.'));

    if (extension == '.jpg') {
      if (file.size < 5242880) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result;
            const picture = { picture: base64, extension };
            alert('La imagen se cargo con exito!');
          };
          reader.onerror = function (error) {
            alert('Hubo un error al cargar la imagen');
          };
        } catch {
          this.clearSelectedPicture();
          this.archivoActual = false;
          alert('Hubo un error al cargar la imagen');
        }
      } else {
        this.clearSelectedPicture();
        this.archivoActual = false;
        alert('La imagen no puede superar los 5Mb');
      }
    } else {
      this.clearSelectedPicture();
      this.archivoActual = false;
      alert('El formato de la imagen no es .JPG');
    }
  }
}


function visaValidator(control: AbstractControl): { [key: string]: boolean } | null {

  if (control.value && control.value.toString().startsWith('4') && control.value.toString().length == 16) {
    return null;

  }

  return { visa: false };

}

function codigoValidator(control: AbstractControl): { [key: string]: boolean } | null {

  if (control.value && tryParseInt(control.value.toString(), false) && control.value.toString().length == 3) {
    return null;

  }

  return { visa: false };

}

function tryParseInt(str, defaultValue) {
  let retValue = defaultValue;
  if (str !== null) {
    if (str.length > 0) {
      if (!isNaN(str)) {
        retValue = true;
      }
    }
  }
  return retValue;
}
let map;
let markers = [];

function initMap() {
  const cordoba = { lat: -31.5, lng: -64.0 };
  map = new google.maps.Map(document.getElementById('mapa'), {
    zoom: 6,
    center: cordoba,
    mapTypeId: 'terrain'
  });

  // This event listener will call addMarker() when the map is clicked.
  map.addListener('click', function (event) {
    deleteMarkers();
    addMarker(event.latLng);
  });

  // Adds a marker at the center of the map.
  addMarker(cordoba);
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
  const marker = new google.maps.Marker({
    position: location,
    map
  });
  markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

export function calleValidator(reg, calle) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = reg.test(control.value);
    if (calle) { return null; }
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}
