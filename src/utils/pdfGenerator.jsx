import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getCompanyLogoBase64 } from './imageUtils';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 10 },
  logo: { width: 50, height: 50, marginRight: 15, objectFit: 'contain' },
  headerText: { flex: 1 },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#2563eb' },
  subtitle: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  reportTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 15, color: '#1f2937' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statBox: { width: '22%', backgroundColor: '#f3f4f6', borderRadius: 6, padding: 8, alignItems: 'center' },
  statValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#2563eb' },
  statLabel: { fontSize: 8, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 15, marginBottom: 8, color: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#2563eb', padding: '6 4' },
  tableHeaderText: { color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', padding: '5 4' },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  tableCell: { fontSize: 9, color: '#374151' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 },
});

const col = (flex) => ({ flex, paddingHorizontal: 4 });

const ReportDocument = ({ stats, products, sales, logoBase64, companyName }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoBase64 && <Image src={logoBase64} style={styles.logo} />}
        <View style={styles.headerText}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Inventario</Text>
          <Text style={styles.subtitle}>Reporte generado: {new Date().toLocaleDateString('es-VE')}</Text>
        </View>
      </View>

      <Text style={styles.reportTitle}>Reporte General del Sistema</Text>

      {stats && (
        <>
          <Text style={styles.sectionTitle}>Resumen Estadístico</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Productos', value: stats.total_products },
              { label: 'Stock Total', value: stats.total_stock },
              { label: 'Ventas', value: stats.total_sales },
              { label: 'Ingresos', value: `$${parseFloat(stats.total_sales_amount ?? 0).toFixed(2)}` },
              { label: 'Deudas', value: stats.total_debts },
              { label: 'Monto Deudas', value: `$${parseFloat(stats.total_debt_amount ?? 0).toFixed(2)}` },
              { label: 'Categorías', value: stats.total_categories },
              { label: 'Proveedores', value: stats.total_providers },
            ].map(({ label, value }) => (
              <View key={label} style={styles.statBox}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {products.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Inventario de Productos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, col(2)]}>Nombre</Text>
              <Text style={[styles.tableHeaderText, col(1.5)]}>Categoría</Text>
              <Text style={[styles.tableHeaderText, col(1)]}>Stock</Text>
              <Text style={[styles.tableHeaderText, col(1)]}>Precio</Text>
            </View>
            {products.slice(0, 20).map((p, i) => (
              <View key={p.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, col(2)]}>{p.name}</Text>
                <Text style={[styles.tableCell, col(1.5)]}>{p.category?.nombre ?? '—'}</Text>
                <Text style={[styles.tableCell, col(1)]}>{p.existencias}</Text>
                <Text style={[styles.tableCell, col(1)]}>${parseFloat(p.price ?? 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.footer}>
        {companyName} — Sistema de Inventario — Generado el {new Date().toLocaleDateString('es-VE')}
      </Text>
    </Page>
  </Document>
);

export const generatePDFReport = async ({ stats, products, sales }) => {
  const logoBase64 = await getCompanyLogoBase64('/logo.png');
  const companyName = localStorage.getItem('companyName') || 'Mi Empresa';

  const blob = await pdf(
    <ReportDocument stats={stats} products={products} sales={sales} logoBase64={logoBase64} companyName={companyName} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
