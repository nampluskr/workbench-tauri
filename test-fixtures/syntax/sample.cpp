// C++ sample.
#include <iostream>
#include <string>
#include <vector>

namespace shop {

template <typename T>
class Basket {
public:
    explicit Basket(std::string owner) : owner_(std::move(owner)) {}

    void add(const T& item) { items_.push_back(item); }

    [[nodiscard]] std::size_t size() const noexcept { return items_.size(); }

private:
    std::string owner_;
    std::vector<T> items_;
};

constexpr int kLimit = 40;

}  // namespace shop

int main() {
    shop::Basket<int> basket{"ann"};
    for (auto i = 0; i < shop::kLimit; ++i) basket.add(i * 2);
    auto raw = R"(raw "text")";
    const bool full = basket.size() >= 0x28u;
    std::cout << "full: " << std::boolalpha << full << ' ' << raw << 1.5e3 << '\n';
    return nullptr == nullptr ? 0 : 1;
}
