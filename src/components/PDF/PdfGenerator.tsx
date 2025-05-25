// PdfGenerator.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Image } from '@react-pdf/renderer';

// Definimos los estilos para nuestro PDF basados en la plantilla HTML
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f6f6f6',
    fontFamily: 'Helvetica',
    color: '#333',
  },
  container: {
    margin: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#004080',
    padding: 16,
    textAlign: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: 100,
    marginBottom: 5,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  credentials: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginVertical: 15,
    borderRadius: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    flex: 1,
  },
  footer: {
    backgroundColor: '#ccc',
    padding: 16,
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerImage: {
    width: 50,
    marginBottom: 5,
  },
});

// Interfaz para los datos genéricos
export interface PdfData {
  title?: string;
  content: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
  footer?: string;
  logoUrl?: string;
}

// Componente para renderizar el PDF
const PdfDocument: React.FC<{ data: PdfData }> = ({ data }) => {
  const logoUrl = data.logoUrl || 'https://ucr-risk-managament-vfte0y-038814-145-223-74-28.traefik.me/firma-tipografica-ucr.png';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header con logo */}
          <View style={styles.header}>
            <Image src={logoUrl} style={styles.headerImage} />
          </View>

          {/* Contenido principal */}
          <View style={styles.content}>
            {data.title && (
              <View style={styles.section}>
                <Text style={styles.title}>{data.title}</Text>
              </View>
            )}

            {/* Contenido */}
            <View style={styles.section}>
              {Object.entries(data.content).map(([key, value], index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.subtitle}>{key}:</Text>
                  <Text style={styles.text}>{String(value)}</Text>
                </View>
              ))}
            </View>

            {/* Si hay elementos para una tabla */}
            {data.items && data.items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.subtitle}>Lista de elementos:</Text>
                <View style={styles.table}>
                  {/* Encabezados de tabla */}
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    {Object.keys(data.items[0]).map((header, index) => (
                      <Text key={index} style={styles.tableCell}>
                        {header}
                      </Text>
                    ))}
                  </View>
                  
                  {/* Filas de datos */}
                  {data.items.map((item, rowIndex) => (
                    <View key={rowIndex} style={styles.tableRow}>
                      {Object.values(item).map((value, cellIndex) => (
                        <Text key={cellIndex} style={styles.tableCell}>
                          {String(value)}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Image src={logoUrl} style={styles.footerImage} />
            <Text>{data.footer || 'Sistema de Gestión de Riesgos - Cuarto de Comunicaciones'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Props para nuestro componente principal
interface PdfGeneratorProps {
  data: PdfData;
  fileName?: string;
  preview?: boolean;
}

// Componente principal que exportamos
const PdfGenerator: React.FC<PdfGeneratorProps> = ({ data, fileName = 'documento.pdf', preview = false }) => {
  return (
    <>
      {preview ? (
        // Previsualización del PDF
        <div style={{ height: '100%', width: '100%', minHeight: '500px' }}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <PdfDocument data={data} />
          </PDFViewer>
        </div>
      ) : (
        // Enlace de descarga
        <PDFDownloadLink
          document={<PdfDocument data={data} />}
          fileName={fileName}
          style={{
            textDecoration: 'none',
            padding: '10px 20px',
            color: '#FFFFFF',
            backgroundColor: '#007bff',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {({ loading }) =>
            loading ? 'Generando PDF...' : 'Descargar PDF'
          }
        </PDFDownloadLink>
      )}
    </>
  );
};

export default PdfGenerator;