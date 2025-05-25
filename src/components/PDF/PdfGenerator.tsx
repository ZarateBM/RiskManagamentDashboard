// PdfGenerator.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

// Definimos los estilos para nuestro PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
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
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
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
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

// Interfaz para los datos genéricos
export interface PdfData {
  title?: string;
  content: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
  footer?: string;
}
// Componente para renderizar el PDF
const PdfDocument: React.FC<{ data: PdfData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.title && (
          <View style={styles.section}>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        )}

        {/* Contenido principal */}
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

        {/* Pie de página */}
        {data.footer && (
          <Text style={styles.footer}>{data.footer}</Text>
        )}
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