import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Importa la extensión de tablas para jsPDF
import logo from './logo.svg';
import './App.css';
import logoOCITY from './images/O-CITY_Logo.jpeg'; // Importa la imagen que quieres añadir al PDF
import noAvailableImage from './images/O-CITY_Logo.jpeg'



function App() {
  const [cityInfo, setCityInfo] = useState({});

  useEffect(() => {
    // Cambia la URL a la de tu API
    axios.get('https://api.test-ocity.icu/api/heritage/lists/byCityId/37816')
      .then(response => {
        setCityInfo(response.data[1])
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);
      // Función para convertir imágenes a Base64
      const convertImageToBase64 = (url, fallbackImage) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'

          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL())
          }

          img.onerror = () => {
            const fallbackImg = new Image()
            fallbackImg.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = fallbackImg.width
              canvas.height = fallbackImg.height
              const ctx = canvas.getContext('2d')
              ctx.drawImage(fallbackImg, 0, 0)
              resolve(canvas.toDataURL())
            }
            fallbackImg.src = fallbackImage
          }

          img.src = url
        })
      }

 const generatePDF =async () => {
    const doc = new jsPDF();

    // Añadir el logo en la esquina superior derecha
    doc.addImage(logoOCITY, 'PNG', 140, 10, 55, 50);
    cityInfo.image = `https://eu2.contabostorage.com/7fb97413b6c243adb4347dafa02551a9:ocity/heritage/images/${cityInfo.image}`
    const base64Image = await convertImageToBase64(cityInfo.image, noAvailableImage)

    // Establecer el tamaño de fuente y agregar el nombre del elemento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cityInfo.name}`, 10, 50);

    // Cambiar a negrita para los títulos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Country: `, 10, 60);
    doc.text(`Creation date: `, 10, 70);
    doc.text(`Organization or Personal Information: `, 10, 80);
    doc.text(`Email: `, 10, 90);
    doc.text(`Location (lat,long): `, 10, 100);

    // Cambiar a normal para los valores correspondientes
    doc.setFont('NotoSans', 'normal');
    doc.text(`${cityInfo.country?.name}`, 30, 60); // Información de país
    doc.text(`${cityInfo.date}`, 45, 70); // Fecha de creación
    doc.text(`${cityInfo.organization}`, 90, 80); // Organización
    doc.text(`${cityInfo.email}`, 30, 90); // Email
    doc.text(`${cityInfo.latitude}, ${cityInfo.longitude}`, 50, 100); // Latitud y Longitud

    // Añadir la imagen principal del elemento
    if (cityInfo.image) {
      doc.addImage(base64Image, 'JPEG', 140, 60, 55, 50)
    }

    // Cambia el tamaño de la fuente para las descripciones
    doc.setFontSize(12);
    
    // Descripción corta y descripción corta local en la misma página
    const maxLineWidth = 180; // Ajustamos el ancho de línea para mantenerlo dentro de los márgenes
    const shortDescriptionLines = doc.splitTextToSize(`Short Description: ${cityInfo.short_heritage_description}`, maxLineWidth);
    const shortLocalDescriptionLines = doc.splitTextToSize(`Short Local Description: ${cityInfo.short_local_heritage_description }`, maxLineWidth);

    doc.text(shortDescriptionLines, 10, 150);
    doc.text(shortLocalDescriptionLines, 10, 170);

    // Crear una nueva página para las descripciones largas
    doc.addPage();

    // Configurar la tabla de descripciones largas
    const extendedDescriptionLines = doc.splitTextToSize(cityInfo.extended_heritage_description, maxLineWidth / 2); // Mitad de ancho para la tabla
    const extendedLocalDescriptionLines = doc.splitTextToSize(cityInfo.extended_local_heritage_description, maxLineWidth / 2);

    const tableColumnHeaders = ["Extended Description", "Extended Local Description"];
    const tableData = [
      [extendedDescriptionLines.join('\n'), extendedLocalDescriptionLines.join('\n')]
    ];

    doc.autoTable({
      head: [tableColumnHeaders],
      body: tableData,
      startY: 30, // Ajustar el inicio de la tabla en la nueva página
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 90 }, // Ancho de la columna 1
        1: { cellWidth: 90 }, // Ancho de la columna 2
      },
      didDrawPage: (data) => {
        let finalY = data.cursor.y; // Obtiene la posición Y donde termina la tabla

        // Añadir "Fields of the heritage" justo debajo de la tabla
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Fields of the heritage:', 10, finalY + 10);

        // Añadir heritageFields
        doc.setFont('helvetica', 'normal');
        doc.text(`Cultural: ${cityInfo.heritageField?.name}`, 10, finalY + 20);

        // Añadir "Tags" justo debajo de los campos de herencia
        doc.setFont('helvetica', 'bold');
        doc.text('Tags:', 10, finalY + 30);

        // Añadir tags
        doc.setFont('helvetica', 'normal');
        doc.text(`${cityInfo.tags?.join(', ')}`, 10, finalY + 40); // Muestra las tags separadas por comas

        // Añadir "Links of Interest" justo debajo de los tags en el PDF
        doc.setFont('helvetica', 'bold');
        doc.text('Links of Interest:', 10, finalY + 50);

        // Añadir "Links of Interest" justo debajo de los tags en el PDF
        doc.setFont('helvetica', 'bold');
        doc.text('Links of Interest:', 10, finalY + 50);

        // Añadir links con color azul
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 255);  // Cambiar el color del texto a azul (RGB: 0, 0, 255)
/*
        if (linkName.length > 0 && linkUrl.length > 0) {
          linkName.forEach((name, index) => {
            if (linkUrl[index]) {
              doc.textWithLink(name, 10, finalY + 60 + (index * 10), { url: linkUrl[index] });
            }
          });
        } else {
          doc.text('No links available', 10, finalY + 60);
        }
*/
        // Restablecer el color de texto al negro para el resto del contenido
        doc.setTextColor(0, 0, 0);
      }
    });

    // Guardar el PDF
    doc.save(`${cityInfo.name}.pdf`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Haz clic en el botón para generar el PDF.
        </p>
        {cityInfo.name && (
          <button onClick={generatePDF}>Generar PDF</button>
        )}
      </header>
    </div>
  );
}

export default App;
