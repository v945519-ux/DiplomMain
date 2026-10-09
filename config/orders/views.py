from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import CreateOrderSerializer, OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderChoicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'delivery_types': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Order.DeliveryType.choices
            ],
            'payment_methods': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Order.PaymentMethod.choices
            ],
            'statuses': [
                {'value': choice[0], 'label': choice[1]}
                for choice in Order.Status.choices
            ],
        })
