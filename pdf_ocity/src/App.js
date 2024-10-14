import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import logo from './logo.svg';
import './App.css';
import logoOCITY from './images/O-CITY_Logo.jpeg'; // Importa la imagen que quieres añadir al PDF

function App() {
  const [itemName, setItemName] = useState('');
  const [date, setDate] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [shortLocalDescription, setShortLocalDescription] = useState('');
  const [extendedDescription, setExtendedDescription] = useState('');
  const [extendedLocalDescription, setExtendedLocalDescription] = useState('');
  const [countryName, setCountryName] = useState('');
  const [image, setImage] = useState('');
  useEffect(() => {
    // Cambia la URL a la de tu API
    axios.get('https://api.test-ocity.icu/api/heritage/lists/byCityId/1') // Cambia la URL
      .then(response => {
        // Aquí asumimos que la API devuelve un array de objetos
        const foundItem = response.data.find(item => item.name === "Iglesia Parroquial de San Francisco de Asís");
        if (foundItem) {
          setItemName(foundItem.name);
          setDate(foundItem.date || '');
          setOrganization(foundItem.organization || '');
          setEmail(foundItem.email || '');
          setLatitude(foundItem.latitude || '');
          setLongitude(foundItem.longitude || '');
          setShortDescription(foundItem.short_heritage_description || '');
          setShortLocalDescription(foundItem.short_local_heritage_description || '');
          setExtendedDescription(foundItem.extended_heritage_description || '');
          setExtendedLocalDescription(foundItem.extended_local_heritage_description || '');
          setCountryName(foundItem.country?.name || '');
          setImage(`https://o-city.org/manifestations_media/${foundItem.image || ''}`);
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();

  
    doc.addImage(logoOCITY, 'PNG', 140, 10, 55, 50);
    // Establece el tamaño de la fuente
    doc.setFontSize(18); // Tamaño de fuente 14
    doc.text(`${itemName}`, 10, 50);

    doc.setFontSize(12);
    doc.text(`Country: ${countryName}`, 10, 60);
    doc.text(`Creation date: ${date}`, 10, 70);
    doc.text(`Organization or Personal Information: ${organization}`, 10, 80);
    doc.text(`Email: ${email}`, 10, 90);
    doc.text(`Location (lat,long): ${latitude},${longitude}`, 10, 100);
    

    doc.addImage(image, 'JPEG', 140, 10, 55, 50);

    // Cambia el tamaño de la fuente para la descripción
    doc.setFontSize(12); // Tamaño de fuente 12

    // Divide el texto de la descripción en líneas que se ajusten al ancho de la página
    const descriptionLines = doc.splitTextToSize(`Descripción: ${shortDescription}`, 190); // 190 es el ancho en mm

    // Agrega las líneas de la descripción al PDF
    doc.text(descriptionLines, 10, 150);

    // Guarda el PDF
    doc.save(`${itemName}.pdf`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Haz clic en el botón para generar el PDF.
        </p>
        {itemName && (
          <button onClick={generatePDF}>Generar PDF</button>
        )}
      </header>
    </div>
  );
}

export default App;
