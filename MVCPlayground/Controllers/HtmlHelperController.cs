using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Mvc;
using MVCPlayground.Customizations;
using MVCPlayground.Models.Autocomplete;
using MVCPlayground.Models.ViewModels.HtmlHelpers;

namespace MVCPlayground.Controllers
{
    public class HtmlHelperController : Controller
    {
        public ActionResult Index()
        {
            return View("Index");
        }

        #region "Autocomplete"

        [HttpGet]
        public async Task<ActionResult> Autocomplete()
        {
            AutocompleteModel model = new AutocompleteModel();
            model.DefaultCountryCode = "CAT";
            model.DefaultCountryName = "Catalunya";
            return View("Autocomplete", model);
        }

        public ActionResult GetCountries(string term)
        {
            var res = Country.FilterCountries(term)
                .Select(a => new { label = a.name, value = a.code });
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCountriesWithDelay(string term)
        {
            var res = Country.FilterCountries(term)
                .Select(a => new { label = a.name, value = a.code });
            Thread.Sleep(1000);
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCountriesWithDifferentImput(string searchTerm)
        {
            var res = Country.FilterCountries(searchTerm)
                .Select(a => new { label = a.name, value = a.code });
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetCountriesWithoutMapping(string term)
        {
            var res = Country.FilterCountries(term);
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region "Postback Issue"

        [HttpGet]
        public async Task<ActionResult> PostBackIssue(PostbackIssueModel model)
        {
            if (model == null)
            {
                model = new PostbackIssueModel()
                {
                    Name = "",
                    IsMale = null
                };
            }
            return View("PostBackIssueView", model);
        }

        [HttpPost]
        [MultipleButton(Name = "action", Argument = "Save")]
        public async Task<ActionResult> PostBackIssue_Save(PostbackIssueModel model)
        {
            return RedirectToAction("PostBackIssue", model);
        }

        [HttpPost]
        [MultipleButton(Name = "action", Argument = "Clear")]
        public async Task<ActionResult> PostBackIssue_Clear(PostbackIssueModel model)
        {
            ModelState.AddModelError("Error", "Some Error");
            return RedirectToAction("PostBackIssue");
        }

        #endregion
    }
}