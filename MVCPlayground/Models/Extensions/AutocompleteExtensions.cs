using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web.Routing;

namespace MVCPlayground.Models.Extensions
{
    public static class HtmlExtensions
    {
        public static HtmlString AutocompleteFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, string id,
            Expression<Func<TModel, TProperty>> expression, Expression<Func<TModel, TProperty>> valueExp, object htmlAttributes)
        {
            var attributes = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
            if (attributes["class"] != null && attributes["class"] != "")
            {
                attributes["class"] += " autocomplete_txt_label";
            }

            HtmlString hdnValue = htmlHelper.HiddenFor(valueExp, new { @class = "autocomplete_hdn_value"});
            HtmlString txtLabel = htmlHelper.TextBoxFor(expression, attributes);
            string output = "<div id=\"" + id + "\" class=\"autocomplete input-group\">"
                    + hdnValue.ToString()
                    + txtLabel.ToString()
                    + "<span class=\"input-group-addon\">"
                      + "<i class=\"glyphicon glyphicon-search autocomplete_icon_search\"></i>"
                      + "<span class=\"btn-loader autocomplete_icon_loading\" style=\"display: none\">&nbsp;&nbsp;&nbsp;&nbsp;</span>"
                    + "</span>"
                + "</div>";

            return new HtmlString(output);
        }
    }
}