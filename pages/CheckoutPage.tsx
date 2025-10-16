
import React, { useState } from 'react';
import { User, Course } from '../types';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface CheckoutPageProps {
  user: User;
  course: Course;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, course, onBack }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const finalPrice = course.price * (1 - discount / 100);

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsCouponLoading(true);
    setCouponMessage(null);
    try {
      const result = await api.validateCoupon(couponCode, course.id);
      setDiscount(result.discountPercentage);
      setCouponMessage({ type: 'success', text: `Cupom de ${result.discountPercentage}% aplicado com sucesso!` });
    } catch (err: any) {
      setDiscount(0);
      setCouponMessage({ type: 'error', text: err.message || 'Erro ao validar cupom.' });
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleFinalizePurchase = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em me matricular no curso "${course.title}".\n` +
      `Usuário: ${user.name} (${user.email})\n` +
      `Valor final: ${finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` +
      (discount > 0 ? ` (com cupom ${couponCode.toUpperCase()} de ${discount}% aplicado).` : '.') +
      `\nAguardo instruções para o pagamento.`
    );
    // Replace with the actual phone number
    const whatsappUrl = `https://wa.me/5500000000000?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-blue-600 hover:underline mb-4">&larr; Voltar aos cursos</button>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden md:flex">
            <div className="md:w-1/2 p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Resumo da Compra</h1>
                <div className="border rounded-lg p-4 flex items-center space-x-4">
                    <img src={course.imageUrl} alt={course.title} className="w-24 h-24 object-cover rounded-md"/>
                    <div>
                        <h2 className="font-semibold text-lg">{course.title}</h2>
                        <p className="text-gray-500 text-sm">Acesso vitalício</p>
                    </div>
                </div>

                <div className="mt-6">
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">Cupom de Desconto</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            id="coupon"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="INSIRA SEU CUPOM"
                        />
                        <button
                            onClick={handleValidateCoupon}
                            disabled={isCouponLoading}
                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200"
                        >
                            {isCouponLoading ? <Spinner size="sm"/> : 'Aplicar'}
                        </button>
                    </div>
                    {couponMessage && (
                        <p className={`mt-2 text-sm ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {couponMessage.text}
                        </p>
                    )}
                </div>
            </div>
            <div className="md:w-1/2 bg-gray-50 p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Pagamento</h2>
                <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                        <span>Preço original</span>
                        <span>{course.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Desconto ({discount}%)</span>
                            <span>- {(course.price - finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    )}
                    <div className="border-t pt-4 flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>{finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>
                <div className="mt-8">
                     <p className="text-sm text-gray-500 text-center mb-4">Para finalizar a compra, você será redirecionado para o WhatsApp para conversar com nossa equipe.</p>
                    <button
                        onClick={handleFinalizePurchase}
                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Finalizar Compra no WhatsApp
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CheckoutPage;
