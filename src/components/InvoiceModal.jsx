import React, { useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { X, Download, FileText } from 'lucide-react';
import { getCompanyLogoBase64 } from '../utils/imageUtils';

const METODO_LABELS = {
  efectivo: 'Efectivo',
  punto_de_venta: 'Punto de Venta',
  transferencia: 'Transferencia Bancaria',
  pago_movil: 'Pago Móvil',
  credito: 'Crédito',
  biopago: 'Biopago',
};

const styles = StyleSheet.create({
  page: { padding: '30 40', fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937', backgroundColor: 'white' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  logoArea: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 48, height: 48, marginRight: 12, objectFit: 'contain' },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  companyInfo: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  invoiceInfo: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#2563eb', letterSpacing: 1 },
  invoiceNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#374151', marginTop: 4 },
  invoiceDate: { fontSize: 9, color: '#6b7280', marginTop: 2 },

  clientBox: { backgroundColor: '#f8fafc', borderRadius: 6, padding: '10 14', marginBottom: 20 },
  clientTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  clientName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827' },
  clientEmail: { fontSize: 9, color: '#6b7280', marginTop: 2 },

  tableHeader: { flexDirection: 'row', backgroundColor: '#1e40af', borderRadius: '4 4 0 0', padding: '7 10' },
  tableHeaderText: { color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  tableRow: { flexDirection: 'row', padding: '7 10', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  tableCell: { fontSize: 9, color: '#374151' },

  totalsBox: { marginTop: 4, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 3 },
  totalLabel: { fontSize: 9, color: '#6b7280', width: 100, textAlign: 'right', paddingRight: 12 },
  totalValue: { fontSize: 9, color: '#374151', width: 80, textAlign: 'right' },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e40af', width: 100, textAlign: 'right', paddingRight: 12 },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e40af', width: 80, textAlign: 'right' },
  bsTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#047857', width: 100, textAlign: 'right', paddingRight: 12 },
  bsTotalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#047857', width: 80, textAlign: 'right' },
  tasaText: { fontSize: 8, color: '#6b7280', width: 180, textAlign: 'right', marginTop: 2 },
  totalLine: { width: 180, height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },

  paymentBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#eff6ff', borderRadius: 6, padding: '6 10' },
  paymentLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1e40af', textTransform: 'uppercase', marginRight: 6 },
  paymentValue: { fontSize: 9, color: '#1e40af' },

  obsBox: { marginTop: 10, padding: '8 10', backgroundColor: '#f8fafc', borderRadius: 6 },
  obsLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 },
  obsText: { fontSize: 9, color: '#374151' },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
});

const col = (flex, align = 'left') => ({ flex, textAlign: align });

const InvoiceDocument = ({ sale, logoBase64, companyName, companyRif }) => {
  const subtotal = sale.products?.reduce((s, p) => s + p.pivot.price * p.pivot.quantity, 0) ?? 0;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const tasaBcv = sale.tasa_bcv ?? 0;
  const hasBs = tasaBcv > 0;
  const totalBs = hasBs ? total * tasaBcv : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            {logoBase64 && <Image src={logoBase64} style={styles.logo} />}
            <View>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.companyInfo}>RIF: {companyRif}</Text>
              <Text style={styles.companyInfo}>Sistema de Inventario</Text>
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNum}>N° {String(sale.numero_factura ?? sale.id?.slice(-6)).padStart(6, '0')}</Text>
            <Text style={styles.invoiceDate}>{new Date(sale.created_at ?? sale.createdAt).toLocaleDateString('es-VE')}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientBox}>
          <Text style={styles.clientTitle}>Facturado a</Text>
          <Text style={styles.clientName}>{sale.user?.name ?? 'Cliente'}</Text>
          {sale.user?.email ? <Text style={styles.clientEmail}>{sale.user.email}</Text> : null}
        </View>

        {/* Products table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, col(3)]}>Descripción</Text>
          <Text style={[styles.tableHeaderText, col(1.2)]}>Código</Text>
          <Text style={[styles.tableHeaderText, col(0.8), { textAlign: 'center' }]}>Cant.</Text>
          <Text style={[styles.tableHeaderText, col(1), { textAlign: 'right' }]}>P. Unit.</Text>
          <Text style={[styles.tableHeaderText, col(1), { textAlign: 'right' }]}>Subtotal</Text>
        </View>
        {(sale.products ?? []).map((item, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, col(3)]}>{item.name}</Text>
            <Text style={[styles.tableCell, col(1.2), { fontFamily: 'Helvetica', color: '#9ca3af' }]}>{item.codigo || '—'}</Text>
            <Text style={[styles.tableCell, col(0.8), { textAlign: 'center' }]}>{item.pivot.quantity}</Text>
            <Text style={[styles.tableCell, col(1), { textAlign: 'right' }]}>${parseFloat(item.pivot.price).toFixed(2)}</Text>
            <Text style={[styles.tableCell, col(1), { textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>${(item.pivot.price * item.pivot.quantity).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalLine} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (16%):</Text>
            <Text style={styles.totalValue}>${iva.toFixed(2)}</Text>
          </View>
          <View style={styles.totalLine} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
          {hasBs && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.bsTotalLabel}>TOTAL Bs:</Text>
                <Text style={styles.bsTotalValue}>Bs {totalBs.toFixed(2)}</Text>
              </View>
              <Text style={styles.tasaText}>Tasa BCV: {tasaBcv.toFixed(2)} Bs/$</Text>
            </>
          )}
        </View>

        {/* Payment method */}
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentLabel}>Método de Pago:</Text>
          <Text style={styles.paymentValue}>{METODO_LABELS[sale.metodo_pago] ?? 'Efectivo'}</Text>
        </View>

        {/* Observations */}
        {sale.observaciones ? (
          <View style={styles.obsBox}>
            <Text style={styles.obsLabel}>Observaciones</Text>
            <Text style={styles.obsText}>{sale.observaciones}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{companyName} — RIF: {companyRif}</Text>
          <Text style={styles.footerText}>Factura N° {String(sale.numero_factura ?? '').padStart(6, '0')}</Text>
          <Text style={styles.footerText}>Gracias por su preferencia</Text>
        </View>
      </Page>
    </Document>
  );
};

const InvoiceModal = ({ sale, onClose }) => {
  const [generating, setGenerating] = useState(false);

  if (!sale) return null;

  const companyName = localStorage.getItem('companyName') || 'Mi Empresa';
  const companyRif = localStorage.getItem('companyRif') || 'J-00000000-0';

  const subtotal = sale.products?.reduce((s, p) => s + p.pivot.price * p.pivot.quantity, 0) ?? 0;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const tasaBcv = sale.tasa_bcv ?? 0;
  const hasBs = tasaBcv > 0;
  const totalBs = hasBs ? total * tasaBcv : 0;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const blob = await pdf(
        <InvoiceDocument sale={sale} logoBase64={logoBase64} companyName={companyName} companyRif={companyRif} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${String(sale.numero_factura ?? sale.id?.slice(-6)).padStart(6, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally { setGenerating(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-primary-600" />
            <div>
              <h2 className="font-bold text-gray-800 dark:text-white">
                Factura N° {String(sale.numero_factura ?? '').padStart(6, '0')}
              </h2>
              <p className="text-xs text-gray-500">{new Date(sale.created_at ?? sale.createdAt).toLocaleDateString('es-VE')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Facturado a</p>
            <p className="font-semibold text-gray-800 dark:text-white">{sale.user?.name ?? '—'}</p>
            {sale.user?.email && <p className="text-sm text-gray-500 dark:text-gray-400">{sale.user.email}</p>}
          </div>

          {/* Products */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Producto</th>
                <th className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Cant.</th>
                <th className="text-right py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Precio</th>
                <th className="text-right py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.products?.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">
                    <p className="text-gray-800 dark:text-white font-medium">{p.name}</p>
                    {p.codigo && <p className="font-mono text-xs text-gray-400">{p.codigo}</p>}
                  </td>
                  <td className="py-2 text-center text-gray-600 dark:text-gray-400">{p.pivot.quantity}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">${parseFloat(p.pivot.price).toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold text-gray-800 dark:text-white">${(p.pivot.price * p.pivot.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>IVA (16%):</span><span>${iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
              <span>TOTAL:</span><span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
            {hasBs && (
              <>
                <div className="flex justify-between font-bold text-base text-green-600 dark:text-green-400">
                  <span>TOTAL Bs:</span><span>Bs {totalBs.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">Tasa BCV: {tasaBcv.toFixed(2)} Bs/$</p>
              </>
            )}
          </div>

          {/* Payment badge */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Método de Pago:</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {METODO_LABELS[sale.metodo_pago] ?? 'Efectivo'}
            </span>
          </div>

          {sale.observaciones && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{sale.observaciones}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <button onClick={onClose}
            className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200">
            Cerrar
          </button>
          <button onClick={handleDownload} disabled={generating}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
            {generating
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              : <Download size={16} />}
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
