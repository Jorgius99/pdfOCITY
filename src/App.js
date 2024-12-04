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

      const generatePDF = async () => {
        const doc = new jsPDF();
      
        // Añadir el logo en la esquina superior derecha
        doc.addImage(logoOCITY, 'PNG', 140, 10, 55, 50);
      
        // Construir la URL de la imagen principal y convertirla a Base64
        cityInfo.image = `https://eu2.contabostorage.com/7fb97413b6c243adb4347dafa02551a9:ocity/heritage/images/${cityInfo.image}`;
        const base64Image = await convertImageToBase64(cityInfo.image, noAvailableImage);
      
        // Título del documento
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text(`${cityInfo.name}`, 10, 50);
      
        doc.setFontSize(12);
        // Información básica
        doc.text(`Country: `, 10, 60);
        doc.text(`Creation date: `, 10, 70);
        doc.text(`Organization or Personal Information: `, 10, 80);
        doc.text(`Email: `, 10, 90);
        doc.text(`Location (lat, long):`, 10, 100);
      
        doc.setFont('helvetica', 'normal');
        doc.text(`${cityInfo.country?.name}`, 30, 60);
        doc.text(`${cityInfo.date?.split('T')[0]}`, 45, 70);
        doc.text(`${cityInfo.organization}`, 90, 80);
        doc.text(`${cityInfo.email}`, 30, 90);
        doc.text(`${cityInfo.latitude}, ${cityInfo.longitude}`, 50, 100);
      
        // Imagen principal
        if (cityInfo.image) {
          doc.addImage(base64Image, 'JPEG', 10, 110, 190, 100); // Imagen centrada
        }
      
        // Descripciones cortas
        const shortDescriptionY = 220; // Posición Y debajo de la imagen
        const maxLineWidth = 180;
      
        doc.setFont('helvetica', 'bold');
        doc.text('Short Description:', 10, shortDescriptionY);
      
        doc.setFont('helvetica', 'normal');
        const shortDescriptionLines = doc.splitTextToSize(
          cityInfo.short_heritage_description,
          maxLineWidth
        );
        doc.text(shortDescriptionLines, 10, shortDescriptionY + 10);
      
        // Crear una nueva página
        doc.addPage();
      
        // Descripción extendida
        doc.setFont('helvetica', 'bold');
        doc.text('Extended Description:', 10, 30);
      
        doc.setFont('helvetica', 'normal');
        const extendedDescriptionLines = doc.splitTextToSize(
          cityInfo.extended_heritage_description,
          maxLineWidth
        );
        doc.text(extendedDescriptionLines, 10, 40);
      
        // Otros datos adicionales
        let finalY = 40 + extendedDescriptionLines.length * 5; // Calcular posición Y después del texto
        doc.setFont('helvetica', 'bold');
        doc.text('Fields of the heritage:', 10, finalY + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cultural: ${cityInfo.heritageField?.name}`, 10, finalY + 20);
      
        doc.setFont('helvetica', 'bold');
        doc.text('Tags:', 10, finalY + 30);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cityInfo.tags?.join(', ')}`, 10, finalY + 40);
      
        doc.setFont('helvetica', 'bold');
        doc.text('Links of Interest:', 10, finalY + 50);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 255); // Si necesitas hipervínculos, aquí puedes formatear
        doc.setTextColor(0, 0, 0); // Volver al color negro
      
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
