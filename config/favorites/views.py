from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product', 'product__category')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        favorite = serializer.save()
        return Response(
            FavoriteSerializer(favorite).data,
            status=status.HTTP_201_CREATED,
        )


class FavoriteDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        product_id = kwargs.get('product_id')
        try:
            favorite = Favorite.objects.get(user=request.user, product_id=product_id)
        except Favorite.DoesNotExist:
            return Response({'detail': 'Не найдено в избранном'}, status=status.HTTP_404_NOT_FOUND)
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
