from rest_framework.throttling import SimpleRateThrottle


class ListingInquiryIPThrottle(SimpleRateThrottle):
    scope = "listing_inquiry_ip"
    rate = "5/hour"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class ListingInquiryUserThrottle(SimpleRateThrottle):
    scope = "listing_inquiry_user"
    rate = "5/hour"

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None
        return self.cache_format % {"scope": self.scope, "ident": request.user.pk}
